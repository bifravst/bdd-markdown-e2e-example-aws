# BDD Feature Runner for AWS Examples

[![GitHub Actions](https://github.com/bifravst/bdd-markdown-e2e-example-aws/workflows/Test%20and%20Release/badge.svg)](https://github.com/bifravst/bdd-markdown-e2e-example-aws/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

Example use of
[@bifravst/bdd-markdown](https://www.npmjs.com/package/@bifravst/bdd-markdown).

    npm ci           # install dependencies
    npx cdk deploy   # deploy the stack to your AWS account
    npm test         # run the tests

_Note: AWS CDK follows the AWS SDK way of authenticating. See
[this guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) to
learn more._

## Webhook receiver

The [`Webhook.feature.md`](./features/Webhook.feature.md) shows how to use AWS
ApiGateway, Lambda and SQS to set up a real test double for a webhook endpoint.
It allows to test that a component which is supposed to send a webhook is
actually sending it.

## Set up CD

You need to create a
[developer token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)
with `repo` and `admin:repo_hook` permissions for an account that has write
permissions to your repository.

You need to store this token in AWS ParameterStore which is a **one-time**
manual step done through the AWS CLI:

    aws ssm put-parameter --name /codebuild/github-token --type String --value <Github Token>
    aws ssm put-parameter --name /codebuild/github-username --type String --value <Github Username>

Then set up the continuous deployment:

    node --experimental-transform-types --no-warnings cdk/cloudformation-cd.ts deploy

## Architecture decision records (ADRs)

see [./adr](./adr).

## Node & NPM

This project requires Node.js `>=24.19.0 <25` and npm `>=12.0.2 <13` (enforced
via `check-node-version` on `npm install` and `npm ci`).

The check is skipped during `npm publish` and `npm pack`, because
`semantic-release` bundles its own npm (`@semantic-release/npm` depends on
`npm@^11.6.2`) and runs the publish with that version rather than the one
installed in CI.

## TypeScript 6 and 7

This repo
[runs TypeScript 6 and 7 side by side](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0),
[so that eslint works](https://github.com/typescript-eslint/typescript-eslint/issues/10940#issuecomment-4922812181).
