javascript: (() => {
  const newBaseURL = "https://ja.react.dev";
  const oldBaseURL = "https://react.dev";
  const currentURL = window.location.href;

  if (currentURL.startsWith(oldBaseURL)) {
    const newPath = currentURL.substring(oldBaseURL.length);
    window.location.href = `${newBaseURL}${newPath}`;
  } else {
    alert("このブックマークレットは https://react.dev のURLでのみ機能します。");
  }
})();
