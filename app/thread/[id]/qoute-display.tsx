"use client"

interface QuoteDisplayProps {
  content: string
}

export default function QuoteDisplay({ content }: QuoteDisplayProps) {
  const parseQuotes = (text: string) => {
    let processedText = text
    const parts = []
    let partIndex = 0

    while (processedText.includes("[QUOTE=") && processedText.includes("[/QUOTE]")) {
      let foundQuote = false
      let searchStart = 0

      while (searchStart < processedText.length) {
        const quoteStart = processedText.indexOf("[QUOTE=", searchStart)
        if (quoteStart === -1) break

        const quoteTagEnd = processedText.indexOf("]", quoteStart)
        if (quoteTagEnd === -1) break

        let quoteEnd = -1
        let quoteDepth = 1
        let searchPos = quoteTagEnd + 1

        while (searchPos < processedText.length && quoteDepth > 0) {
          const nextQuoteStart = processedText.indexOf("[QUOTE=", searchPos)
          const nextQuoteEnd = processedText.indexOf("[/QUOTE]", searchPos)

          if (nextQuoteEnd === -1) break

          if (nextQuoteStart !== -1 && nextQuoteStart < nextQuoteEnd) {
            quoteDepth++
            searchPos = nextQuoteStart + 7
          } else {
            quoteDepth--
            if (quoteDepth === 0) {
              quoteEnd = nextQuoteEnd
            }
            searchPos = nextQuoteEnd + 8
          }
        }

        if (quoteEnd === -1) {
          searchStart = quoteStart + 1
          continue
        }

        const username = processedText.substring(quoteStart + 7, quoteTagEnd)
        const quotedContent = processedText.substring(quoteTagEnd + 1, quoteEnd)

        const placeholder = `__QUOTE_${partIndex}__`
        processedText = processedText.substring(0, quoteStart) + placeholder + processedText.substring(quoteEnd + 8)

        parts[partIndex] = (
          <div key={`quote-${partIndex}`} className="bg-gray-50 border-l-4 border-blue-500 p-3 mb-3 rounded-r">
            <div className="text-xs text-gray-600 mb-1 font-semibold">Originally posted by {username}:</div>
            <div className="text-sm text-gray-700 italic whitespace-pre-wrap">
              {quotedContent.includes("__QUOTE_") ? parseQuotePlaceholders(quotedContent, parts) : quotedContent}
            </div>
          </div>
        )

        partIndex++
        foundQuote = true
        break
      }

      if (!foundQuote) break
    }

    return parseQuotePlaceholders(processedText, parts)
  }

  const parseQuotePlaceholders = (text: string, quoteParts: any[]) => {
    const elements = []
    let remainingText = text

    while (remainingText.includes("__QUOTE_")) {
      const placeholderStart = remainingText.indexOf("__QUOTE_")
      const placeholderEnd = remainingText.indexOf("__", placeholderStart + 8)

      if (placeholderEnd === -1) break

      if (placeholderStart > 0) {
        const beforeText = remainingText.substring(0, placeholderStart).trim()
        if (beforeText) {
          elements.push(
            <div key={`text-${elements.length}`} className="whitespace-pre-wrap mb-3">
              {beforeText}
            </div>,
          )
        }
      }

      const placeholderText = remainingText.substring(placeholderStart, placeholderEnd + 2)
      const quoteIndex = Number.parseInt(placeholderText.match(/\d+/)?.[0] || "0")
      if (quoteParts[quoteIndex]) {
        elements.push(quoteParts[quoteIndex])
      }

      remainingText = remainingText.substring(placeholderEnd + 2)
    }

    if (remainingText.trim()) {
      elements.push(
        <div key={`text-${elements.length}`} className="whitespace-pre-wrap">
          {remainingText.trim()}
        </div>,
      )
    }

    return elements.length > 0 ? <div>{elements}</div> : <div className="whitespace-pre-wrap">{text}</div>
  }

  return parseQuotes(content)
}
