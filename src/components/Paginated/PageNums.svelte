<script lang='ts'>
    export let changePage: (n: number) => void;
    export let currentPage: number;
    export let totalPages: number;

    const pages = new Array();
    for (let p = 1; p <= totalPages; ++p) {
        pages.push(p.toString());
    }

</script>

<div class='flex flex-row w-8/12 justify-center self-center items-center'>

    <button class='font-mono text-xl inline-flex justify-self-center font-medium' on:click={() => changePage(currentPage - 1)}>
        {'<'}
    </button>
    {#each pages as pageNum}
        <div class={`font-medium text-center ${Number(pageNum) - 1 === currentPage ? 'text-blue-500 mt-2' : ''}`}>
            <button on:click={() => changePage(Number(pageNum) - 1)} class='mx-3 flex flex-row items-end'><div>[</div><div class='mx-1'>{pageNum}</div><div>]</div></button>
        </div>
    {/each}
    <button class='font-mono text-xl inline-flex justify-self-center font-medium' on:click={() => changePage(currentPage + 1)}>
        {'>'}
    </button>

</div>






