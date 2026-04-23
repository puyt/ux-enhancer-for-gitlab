export interface IEpicAssignee {
    username: string;
    name: string;
    avatarUrl: string | null;
    webUrl: string;
}

interface IGraphqlResponse {
    data?: {
        group?: {
            workItem?: {
                widgets?: Array<{
                    type?: string;
                    assignees?: { nodes?: IEpicAssignee[] };
                }>;
            } | null;
            epic?: {
                assignees?: { nodes?: IEpicAssignee[] };
            } | null;
        } | null;
    };
    errors?: Array<{ message: string }>;
}

const QUERY = `query glabEnhancerEpicAssignees($fullPath: ID!, $iid: String!) {
    group(fullPath: $fullPath) {
        workItem(iid: $iid) {
            widgets {
                ... on WorkItemWidgetAssignees {
                    type
                    assignees {
                        nodes {
                            username
                            name
                            avatarUrl
                            webUrl
                        }
                    }
                }
            }
        }
    }
}`;

const LEGACY_QUERY = `query glabEnhancerEpicAssigneesLegacy($fullPath: ID!, $iid: String!) {
    group(fullPath: $fullPath) {
        epic(iid: $iid) {
            assignees {
                nodes {
                    username
                    name
                    avatarUrl
                    webUrl
                }
            }
        }
    }
}`;

function getCsrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return meta?.content || '';
}

async function postGraphql(query: string, variables: Record<string, string>): Promise<IGraphqlResponse> {
    const response = await fetch(`${window.location.origin}/api/graphql?is_custom=1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': getCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
    }

    return await response.json();
}

export async function fetchEpicAssignees(fullPath: string, iid: number): Promise<IEpicAssignee[]> {
    const variables = {
        fullPath,
        iid: String(iid),
    };

    let json: IGraphqlResponse;
    try {
        json = await postGraphql(QUERY, variables);
    } catch {
        return [];
    }

    const widgets = json.data?.group?.workItem?.widgets || [];
    const assigneeWidget = widgets.find(w => w?.assignees?.nodes);
    let nodes = assigneeWidget?.assignees?.nodes || [];

    if (!json.data?.group?.workItem) {
        try {
            const legacy = await postGraphql(LEGACY_QUERY, variables);
            nodes = legacy.data?.group?.epic?.assignees?.nodes || [];
        } catch {
            // ignore
        }
    }

    return nodes;
}
