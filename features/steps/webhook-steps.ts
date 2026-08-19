import type { StepRunner } from '@bifravst/bdd-markdown'
import { codeBlockOrThrow, regExpMatchedStep } from '@bifravst/bdd-markdown'
import { Type } from '@sinclair/typebox'
import assert from 'assert/strict'
import type { World } from '../run-features.ts'
import { WebhookReceiver } from './webhook-receiver.ts'

export const steps = (): StepRunner<World>[] => {
	let r: WebhookReceiver

	return [
		{
			match: (title) => /^I have a Webhook Receiver$/.test(title),
			run: async ({ log, context: { webhookQueue } }) => {
				log.progress(`Webhook queue: ${webhookQueue}`)
				r = new WebhookReceiver({ queueUrl: webhookQueue })
				await r.clearQueue()
			},
		},
		regExpMatchedStep(
			{
				regExp:
					/^the Webhook Receiver `(?<MessageGroupId>[^"]+)` should be called$/,
				schema: Type.Object({ MessageGroupId: Type.String() }),
			},
			async ({ match: { MessageGroupId }, log }) => {
				await r.receiveWebhookRequest(MessageGroupId, log)
			},
		),
		{
			match: (title) =>
				/^the webhook request body should equal this JSON$/.test(title),
			run: async ({ step }) => {
				assert.deepEqual(
					JSON.parse(codeBlockOrThrow(step).code),
					r.latestWebhookRequest?.body,
				)
			},
		},
	]
}
