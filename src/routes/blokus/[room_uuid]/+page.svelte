<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;
</script>
<!-- Board를 data로 받아오는 것이 나을 듯 -->
<h1>
    {data.block}
</h1>
