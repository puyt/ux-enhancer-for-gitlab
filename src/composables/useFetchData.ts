import {
    computed,
    ref,
    type Ref,
} from 'vue';

export interface FetchDataOptions {
    /**
     * Number of items per page
     * @default 100
     */
    perPage?: number;

    /**
     * Whether to fetch all pages automatically
     * @default true
     */
    fetchAllPages?: boolean;

    /**
     * Custom base URL to use instead of window.location.origin
     */
    baseUrl?: string;

    /**
     * Additional query parameters to include in the request
     */
    queryParams?: Record<string, string | number | boolean>;

    /**
     * Custom headers to include in the request
     */
    headers?: Record<string, string>;
}

export interface FetchDataResult<T = any> {
    /**
     * The fetched data array
     */
    data: Ref<T | null>;

    /**
     * Loading state
     */
    isLoading: Ref<boolean>;

    /**
     * Error state
     */
    error: Ref<string | null>;

    /**
     * Total number of items (from x-total header)
     */
    total: Ref<number>;

    /**
     * Total number of pages (from x-total-pages header)
     */
    totalPages: Ref<number>;

    /**
     * Current page number
     */
    currentPage: Ref<number>;

    /**
     * Whether there are more pages to fetch
     */
    hasNextPage: Ref<boolean>;

    /**
     * Function to fetch the next page
     */
    fetchNextPage: () => Promise<void>;

    /**
     * Function to refetch all data
     */
    refetch: () => Promise<void>;

    /**
     * Function to reset the data and state
     */
    reset: () => void;
}

/**
 * Composable for fetching data from GitLab API with pagination support
 *
 * @param endpoint - The API endpoint (relative path like '/api/v4/projects' or full URL)
 * @param options - Configuration options for the fetch operation
 * @returns Promise that resolves to an object containing data, loading state, error state, and utility functions
 */
export async function useFetchData<T = any>(
    endpoint: string,
    options: FetchDataOptions = {},
): Promise<FetchDataResult<T>> {
    const {
        perPage = 100,
        fetchAllPages = true,
        baseUrl,
        queryParams = {},
        headers = {},
    } = options;

    const data: Ref<T | null> = ref(null);
    const isLoading: Ref<boolean> = ref(false);
    const error: Ref<string | null> = ref(null);
    const total: Ref<number> = ref(0);
    const totalPages: Ref<number> = ref(0);
    const currentPage: Ref<number> = ref(0);

    const hasNextPage = computed(() => currentPage.value < totalPages.value);

    function getBaseUrl(): string {
        return baseUrl || window.location.origin;
    }

    function buildUrl(page: number = 1): string {
        let url = endpoint;

        // If endpoint doesn't start with http, prepend the base URL
        if (!endpoint.startsWith('http')) {
            const base = getBaseUrl();
            url = endpoint.startsWith('/') ? `${base}${endpoint}` : `${base}/${endpoint}`;
        }

        // Build query parameters
        const params = new URLSearchParams();

        // Add is_custom parameter if enabled
        params.set('is_custom', '1');

        // Add per_page parameter
        params.set('per_page', perPage.toString());

        // Add page parameter
        params.set('page', page.toString());

        // Add custom query parameters
        Object.entries(queryParams)
            .forEach(([key, value]) => {
                params.set(key, value.toString());
            });

        // Append query parameters to URL
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${params.toString()}`;
    }

    /**
     * Fetch a single page of data
     */
    async function fetchPage(page: number): Promise<T> {
        const url = buildUrl(page);

        const requestHeaders = {
            'Accept': 'application/json',
            ...headers,
        };

        const response = await fetch(url, {
            method: 'GET',
            headers: requestHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        // Update pagination info from headers
        const totalHeader = response.headers.get('x-total');
        const totalPagesHeader = response.headers.get('x-total-pages');

        if (totalHeader) {
            total.value = parseInt(totalHeader, 10);
        }

        if (totalPagesHeader) {
            totalPages.value = parseInt(totalPagesHeader, 10);
        }

        return await response.json();
    }

    async function fetchNextPage(): Promise<void> {
        if (!hasNextPage.value || isLoading.value) {
            return;
        }

        try {
            isLoading.value = true;
            error.value = null;

            const nextPage = currentPage.value + 1;
            const pageData = await fetchPage(nextPage);

            if (Array.isArray(data.value)) {
                data.value.push(...(pageData as []));
            }
            currentPage.value = nextPage;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch next page';
            console.error('Error fetching next page:', err);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchData(): Promise<void> {
        try {
            isLoading.value = true;
            error.value = null;

            // Reset state
            data.value = null;
            currentPage.value = 0;
            total.value = 0;
            totalPages.value = 0;

            // Fetch first page
            data.value = await fetchPage(1);
            currentPage.value = 1;

            // If fetchAllPages is enabled and there are more pages, fetch them
            if (fetchAllPages && totalPages.value > 1) {
                const fetchPromises: Promise<T>[] = [];

                for (let page = 2; page <= totalPages.value; page++) {
                    fetchPromises.push(fetchPage(page));
                }

                const remainingPagesData = await Promise.all(fetchPromises);
                remainingPagesData.forEach((pageData) => {
                    if (Array.isArray(data.value)) {
                        data.value.push(...(pageData as []));
                    }
                });

                currentPage.value = totalPages.value;
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch data';
            console.error('Error fetching data:', err);
        } finally {
            isLoading.value = false;
        }
    }

    async function refetch(): Promise<void> {
        await fetchData();
    }

    function reset(): void {
        data.value = null;
        isLoading.value = false;
        error.value = null;
        total.value = 0;
        totalPages.value = 0;
        currentPage.value = 0;
    }

    await fetchData();

    return {
        data,
        isLoading,
        error,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        reset,
    };
}