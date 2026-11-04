import "server-only";

import { graphql } from "@/gql";
import { runMutation, runQuery } from "@/lib/graphql.server";

const AppsQuery = graphql(`
    query Apps {
        me { username displayName }
        appPasswords { id name createdAt lastUsedAt expiresAt expired }
        apiKeys { id name createdAt lastUsedAt }
        settings { appPasswordExpiryMonths }
    }
`);

const AppPasswordCreateMutation = graphql(`
    mutation AppPasswordCreate($name: String!) {
        appPasswordCreate(name: $name) { password username appPassword { id name } }
    }
`);
const AppPasswordRevokeMutation = graphql(`
    mutation AppPasswordRevoke($id: ID!) { appPasswordRevoke(id: $id) }
`);
const ApiKeyCreateMutation = graphql(`
    mutation ApiKeyCreate($name: String!) { apiKeyCreate(name: $name) { key apiKey { id name } } }
`);
const ApiKeyRevokeMutation = graphql(`
    mutation ApiKeyRevoke($id: ID!) { apiKeyRevoke(id: $id) }
`);

export const getApps = () => runQuery(AppsQuery, {});
export const appPasswordCreate = async (name: string) => (await runMutation(AppPasswordCreateMutation, { name }))?.appPasswordCreate;
export const appPasswordRevoke = (id: string) => runMutation(AppPasswordRevokeMutation, { id });
export const apiKeyCreate = async (name: string) => (await runMutation(ApiKeyCreateMutation, { name }))?.apiKeyCreate;
export const apiKeyRevoke = (id: string) => runMutation(ApiKeyRevokeMutation, { id });
