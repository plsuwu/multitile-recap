<script lang="ts">
    const { jobData = undefined } = $props();

    let job = $state({
        complete: 0,
        total: 0,
        status: '',
        message: '',
        color: '#000000',
    });

    $effect(() => {
        if (jobData) {
            job = jobData;
        }
    });
</script>

{job.complete} of {job.total}
<div>
	fetch: '<span class="font-semibold">{job.message}</span>'
	{#if job.complete === job.total}
		<div>(job complete)</div>
	{/if}
</div>
