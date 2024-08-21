export function getInitialAndSortKey(name: string): {
  initial: string;
  sortKey: string;
} {
  const firstChar = name.charAt(0);
  const unicode = firstChar.charCodeAt(0);

  // 한글 처리
  if (unicode >= 44032 && unicode <= 55203) {
    const initial = String.fromCharCode(
      Math.floor((unicode - 44032) / 588) + 4352,
    );
    return { initial, sortKey: `1${initial}${name}` };
  }

  // 영어 및 기타 문자
  const uppercaseChar = firstChar.toUpperCase();
  return { initial: uppercaseChar, sortKey: `2${uppercaseChar}${name}` };
}
