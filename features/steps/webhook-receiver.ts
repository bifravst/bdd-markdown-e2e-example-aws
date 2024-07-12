import type { QueueAttributeName } from '@aws-sdk/client-sqs'
import {
	DeleteMessageCommand,
	ReceiveMessageCommand,
	SQSClient,
} from '@aws-sdk/client-sqs'
import type { Logger } from '@bifravst/bdd-markdown'

type WebhookRequest = {
	headers: { [key: string]: string }
	body: { [key: string]: string }
}

/**
 * Manages the waiting for webhook requests.
 */
export class WebhookReceiver {
	private readonly queueUrl: string
	private readonly sqs: SQSClient
	latestWebhookRequest?: WebhookRequest

	constructor({ queueUrl }: { queueUrl: string }) {
		this.queueUrl = queueUrl
		this.sqs = new SQSClient({})
	}

	/**
	 * When multiple alerts are configured, messages may result in the webhook
	 * receiver receiving multiple requests from different alerts.
	 *
	 * This receiver will fetch a webhook request for a specific message group
	 * id (which is the path after the API URL: {webhookReceiver}/message-group).
	 *
	 * Requests from other message groups will be discarded.
	 */
	async receiveWebhookRequest(
		MessageGroupId: string,
		log: Logger,
	): Promise<WebhookRequest> {
		const { Messages } = await this.sqs.send(
			new ReceiveMessageCommand({
				QueueUrl: this.queueUrl,
				MaxNumberOfMessages: 1,
				MessageAttributeNames: ['All'],
				AttributeNames: ['MessageGroupId' as QueueAttributeName],
				WaitTimeSeconds: 20,
			}),
		)

		const msg = Messages?.[0]

		if (msg === undefined) {
			throw new Error('No webhook request received!')
		}
		const { Body, MessageAttributes, ReceiptHandle, Attributes } = msg
		await this.sqs.send(
			new DeleteMessageCommand({
				QueueUrl: this.queueUrl,
				ReceiptHandle: ReceiptHandle as string,
			}),
		)

		if (Attributes === undefined || MessageAttributes === undefined)
			throw new Error(
				`No attributes defined in Message "${JSON.stringify(msg)}"!`,
			)

		const attrs = MessageAttributes
		const { MessageGroupId: RcvdMessageGroupId } = Attributes
		this.latestWebhookRequest = {
			headers: Object.keys(attrs ?? {}).reduce(
				(hdrs: { [key: string]: string }, key) => {
					hdrs[key] = attrs[key].StringValue as string
					return hdrs
				},
				{},
			),
			body: JSON.parse(Body as string),
		}
		log.progress(
			`Webhook < ${RcvdMessageGroupId}`,
			JSON.stringify(this.latestWebhookRequest.body),
		)
		if (RcvdMessageGroupId !== MessageGroupId) {
			throw new Error(
				`Wrong webhook request received! Expected "${MessageGroupId}", got "${RcvdMessageGroupId}"`,
			)
		}
		return this.latestWebhookRequest
	}

	/**
	 * Deletes all messages in a Queue instead of using purge (which can only be used every 60 seconds)
	 */
	async clearQueue(): Promise<void> {
		const { Messages } = await this.sqs.send(
			new ReceiveMessageCommand({
				QueueUrl: this.queueUrl,
				MaxNumberOfMessages: 10,
				WaitTimeSeconds: 0,
			}),
		)

		if (Messages !== undefined) {
			await Promise.all(
				Messages.map(async ({ ReceiptHandle }) =>
					this.sqs.send(
						new DeleteMessageCommand({
							QueueUrl: this.queueUrl,
							ReceiptHandle: ReceiptHandle as string,
						}),
					),
				),
			)
			await this.clearQueue()
			this.latestWebhookRequest = undefined
		}
	}
}
