
<div class="placeholder shimmer"></div>

<style>
  /* Placeholder loading  */
  .placeholder {
    min-height: 3em;
    width: 100%;
    background: #d8e3d2;
    border-radius: 1em;
  }

  .shimmer {
    overflow: hidden;
    position: relative;
  }

  .shimmer::before {
    content: "";
    position: absolute;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    height: 100%;
    width: 100%;
    z-index: 1;
    animation: shimmer 1s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>