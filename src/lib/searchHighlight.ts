export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
};

export const createHighlightedElement = (text: string, searchTerm: string) => {
  const highlightedText = highlightSearchTerm(text, searchTerm);
  return { __html: highlightedText };
};