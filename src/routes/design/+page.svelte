<script lang="ts">
  import Confirm from "$lib/components/Confirm.svelte";
  import { modalStore, movePreviewStore } from "../../lib/store";

  // 테스트용 상태와 핸들러
  let showModal = $state(true);
  const handleConfirm = () => {
    console.log("confirmed");
  };
  const handleCancel = () => {
    console.log("cancelled");
  };
</script>

<div class="design-test-container">
  <h1>디자인 테스트 페이지</h1>

  <!-- 모달 컴포넌트 테스트 -->
  <div class="test-section">
    <h2>Confirm 모달</h2>
    <button
      onclick={() =>
        modalStore.open(Confirm, {
          title: "테스트 제목",
          // message: "이것은 테스트 메시지입니다. 디자인이 어떻게 보이나요?",
          message: `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAAClCAYAAADS6VbkAAAE8klEQVR4Xu3dW1LbUBCEYWlvFPtgZezDsLdEWLEs4ot4cel38fEYU9SpUaunu2d8Mv6ZfoYdfz4/P4eXl5cdTzAMzjCXv1CH8QuQb2/74OH9/VwEZ5hfzMPhsMvDeH19XQC55xkAMvZS7AmGE0PueQaABMgjI2PIqQha9tyd13XYk50wZIydCjoWIJmaRcwD5P7GioaMsTSGxJAYkqm5FPOFdlk4A4bEkBgSQ2LI9ThG7DNX4ysLZWqYGsH4iR0E44LxdafAkMFpEVPD1DA1TA1Tw9Rcbtlp2Vr2ggrbPkEwCMbNslP6DSABEiDtQ36TDYJxwbhgXDD+3WEaHRodLoioTYsE44LxlI4FSIAESJMakxqTGpOaywoEw3ktW8vWsrVsLVvL1rK17KsVOGeAmZsr7pzz4R8VroBzhvkxF+owfnx87Ho/5DiOw85XVA7OMAMyUQcXljaYocBOhTNklit+e9xR0G+FMwBk5ObYAhgKZwBIgLR+dm39TMvef1sbQ66WYwESIFPfOgRIgATI0Ay30C4LZ2BqmBqmhqn5PpGtfEkfQzI1KXYCSIAEyFWzYGqYmgUOFdnA1DA1KZYGSIAESC6by762+U1D0pA05PrNcKdN6/ssYh+xT0q/ASRAAqQckqG4ZSgwJIbEkBgSQ2LIaxWY/o3L5rLX0JBDyiHlkHLIy3ZRWWxgapgapoapYWqYGqbmRgWYGqbmP2jQb62Xwj6kfciUjj0C8m4/efCHhSvgnGF+yIU6uLB0ehCJizpd3Hp8KTBkhBkK7FQ4Aw1JQ/Y0pP+43EVPlbQBQ2JIDHky7rZ9WhmgWbZZdoqdABIgAdJyheUKyxWWKyxX/GDiZ2N8KlIl7ijot8IZxD5in5SOBUiABEg5JGN1y1hhSAyJITEkhsSQN2IHLrs1vtSytWwtW8vWsrVsLfsppkVatpatZWvZWraWrWVr2VsLHjbGW5GL5QoLuin9BpAACZCrNmof0j7kAofKxErsI/ZJsTRAAiRAyiHlkHJIOaQcUg65VQE55LpCi8v+Wdke81uFK+CcYX62hTq4sHR6EC4snQGZqIMrnRvMUGCnwhmOsc/hcHhMP974q5UwtjAyc4b50gaAlEP2ckgM6QbdSrfCkBgSQ56kZeWtpN86l25hSAyJITGkWfbdWTZTw9RU5JOWrWVr2Vq2lq1lWz97nvUzGpKGpCGn97VSBDlk51kwNUwNU8PUMDVMDVPD1GwtWdKQc4XU4VwHGpKGTL0UAAmQAMnUMDVMDVPD1DA1WxVgatYV8iUvDnfBQ8XpMzVMDVPD1DA1TA1Tw9RsSfqKbrHt05kW0ZA0JA1JQ9KQNCQN+TwackvrPfLzwhVwzjA/4UIdXFg6PYjERZ3jOEw3Iz7y3d/824k6uLC0wQwFdiqcgcvmsrlsLpvL5rK57Odx2S4KcFFAZWpGQ9KQNCQNSUPSkDQkDbmVxFZ0i20f2z4p3QKQAAmQq/ahU8zF8CWvf0XAkBgSQ2LIC4uBITHkAoqKbBCMC8ZT3QogARIgTWpMakxqTGpMakxqtipwzt9ET3LIlHYCSIAEyGAWymVz2akXEyABEiDFPmIfsY/YR+yzFXpU5qccrm2flG4BSIAEyGDkUngxuWwuO0UOAAmQACn2EfvcjX223PAjPy9cAecM8xMu1MGFpdODSFzU6cLS40vxFz0zfyTyY+HrAAAAAElFTkSuQmCC" alt="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAAClCAYAAADS6VbkAAAE8klEQVR4Xu3dW1LbUBCEYWlvFPtgZezDsLdEWLEs4ot4cel38fEYU9SpUaunu2d8Mv6ZfoYdfz4/P4eXl5cdTzAMzjCXv1CH8QuQb2/74OH9/VwEZ5hfzMPhsMvDeH19XQC55xkAMvZS7AmGE0PueQaABMgjI2PIqQha9tyd13XYk50wZIydCjoWIJmaRcwD5P7GioaMsTSGxJAYkqm5FPOFdlk4A4bEkBgSQ2LI9ThG7DNX4ysLZWqYGsH4iR0E44LxdafAkMFpEVPD1DA1TA1Tw9Rcbtlp2Vr2ggrbPkEwCMbNslP6DSABEiDtQ36TDYJxwbhgXDD+3WEaHRodLoioTYsE44LxlI4FSIAESJMakxqTGpOaywoEw3ktW8vWsrVsLVvL1rK17KsVOGeAmZsr7pzz4R8VroBzhvkxF+owfnx87Ho/5DiOw85XVA7OMAMyUQcXljaYocBOhTNklit+e9xR0G+FMwBk5ObYAhgKZwBIgLR+dm39TMvef1sbQ66WYwESIFPfOgRIgATI0Ay30C4LZ2BqmBqmhqn5PpGtfEkfQzI1KXYCSIAEyFWzYGqYmgUOFdnA1DA1KZYGSIAESC6by762+U1D0pA05PrNcKdN6/ssYh+xT0q/ASRAAqQckqG4ZSgwJIbEkBgSQ2LIaxWY/o3L5rLX0JBDyiHlkHLIy3ZRWWxgapgapoapYWqYGqbmRgWYGqbmP2jQb62Xwj6kfciUjj0C8m4/efCHhSvgnGF+yIU6uLB0ehCJizpd3Hp8KTBkhBkK7FQ4Aw1JQ/Y0pP+43EVPlbQBQ2JIDHky7rZ9WhmgWbZZdoqdABIgAdJyheUKyxWWKyxX/GDiZ2N8KlIl7ijot8IZxD5in5SOBUiABEg5JGN1y1hhSAyJITEkhsSQN2IHLrs1vtSytWwtW8vWsrVsLfsppkVatpatZWvZWraWrWVr2VsLHjbGW5GL5QoLuin9BpAACZCrNmof0j7kAofKxErsI/ZJsTRAAiRAyiHlkHJIOaQcUg65VQE55LpCi8v+Wdke81uFK+CcYX62hTq4sHR6EC4snQGZqIMrnRvMUGCnwhmOsc/hcHhMP974q5UwtjAyc4b50gaAlEP2ckgM6QbdSrfCkBgSQ56kZeWtpN86l25hSAyJITGkWfbdWTZTw9RU5JOWrWVr2Vq2lq1lWz97nvUzGpKGpCGn97VSBDlk51kwNUwNU8PUMDVMDVPD1GwtWdKQc4XU4VwHGpKGTL0UAAmQAMnUMDVMDVPD1DA1WxVgatYV8iUvDnfBQ8XpMzVMDVPD1DA1TA1Tw9RsSfqKbrHt05kW0ZA0JA1JQ9KQNCQN+TwackvrPfLzwhVwzjA/4UIdXFg6PYjERZ3jOEw3Iz7y3d/824k6uLC0wQwFdiqcgcvmsrlsLpvL5rK57Odx2S4KcFFAZWpGQ9KQNCQNSUPSkDQkDbmVxFZ0i20f2z4p3QKQAAmQq/ahU8zF8CWvf0XAkBgSQ2LIC4uBITHkAoqKbBCMC8ZT3QogARIgTWpMakxqTGpMakxqtipwzt9ET3LIlHYCSIAEyGAWymVz2akXEyABEiDFPmIfsY/YR+yzFXpU5qccrm2flG4BSIAEyGDkUngxuWwuO0UOAAmQACn2EfvcjX223PAjPy9cAecM8xMu1MGFpdODSFzU6cLS40vxFz0zfyTyY+HrAAAAAElFTkSuQmCC" class="transparent">`,
          confirmText: "확인",
          cancelText: "취소",
          onConfirm: handleConfirm,
          onCancel: handleCancel,
        })}>d</button
    >
  </div>
</div>

<style>
  .design-test-container {
    padding: 2rem;
  }

  .test-section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ccc;
  }
</style>
