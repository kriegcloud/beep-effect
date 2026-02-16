/** Check if a cluster error is retryable */
export const isRetryable = (error: unknown): boolean => {
	if (typeof error === "object" && error !== null && "retryable" in error) {
		return Boolean((error as { retryable: unknown }).retryable)
	}
	return false
}
