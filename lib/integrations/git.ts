/**
 * Git Integration Service (Mock-ready)
 * Configure GIT_TOKEN env var for real GitHub/GitLab API calls.
 */

export interface PRStatus {
    url: string;
    title: string;
    status: "open" | "merged" | "closed";
    author: string;
    updatedAt: string;
}

export async function fetchPRStatus(link: string): Promise<PRStatus | null> {
    const { GIT_TOKEN } = process.env;

    // Parse GitHub/GitLab URL
    const githubMatch = link.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    const gitlabMatch = link.match(/gitlab\.com\/([^/]+)\/([^/]+)\/-\/merge_requests\/(\d+)/);

    if (GIT_TOKEN && githubMatch) {
        try {
            const [, owner, repo, prNumber] = githubMatch;
            const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
                headers: { Authorization: `Bearer ${GIT_TOKEN}`, Accept: "application/vnd.github.v3+json" },
            });
            if (!resp.ok) return null;
            const data = await resp.json();
            return {
                url: link,
                title: data.title,
                status: data.merged ? "merged" : data.state === "closed" ? "closed" : "open",
                author: data.user?.login || "unknown",
                updatedAt: data.updated_at,
            };
        } catch {
            return null;
        }
    }

    // Mock response for demo
    console.log(`🔗 [MOCK] Fetching PR status for: ${link}`);
    return {
        url: link,
        title: `PR from ${link.split("/").pop()}`,
        status: "open",
        author: "developer",
        updatedAt: new Date().toISOString(),
    };
}
