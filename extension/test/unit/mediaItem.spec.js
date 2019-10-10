import MediaItem from '../../core/mediaItem'

// For linter to be quiet.
/* global describe, it, expect */

describe('Util functions work:', () => {
  it('Local file name resolution', () => {
    const filename = (url, mimeType) => {
      const item = new MediaItem(url, mimeType, 0)
      return item.getLocalFilename()
    }

    const jpeg = (url) => { return filename(url, 'image/jpeg') }
    const png = (url) => { return filename(url, 'image/png') }

    // No querystrings
    expect(jpeg('https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.jpeg')).toEqual('Wikipedia_logo_593.jpeg')
    expect(jpeg('https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.jpg')).toEqual('Wikipedia_logo_593.jpeg')
    expect(png('https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.jpg')).toEqual('Wikipedia_logo_593.png')
    expect(png('https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.png')).toEqual('Wikipedia_logo_593.png')

    // With querystring
    expect(jpeg('https://webiste.com/Wikipedia_logo_593.jpeg?param1=5&cat=2')).toEqual('Wikipedia_logo_593.jpeg')
    expect(jpeg('https://webiste.com/Wikipedia_logo_593.jpg?param1=5&cat=2')).toEqual('Wikipedia_logo_593.jpeg')
    expect(png('https://webiste.com/Wikipedia_logo_593.png?param1=5&cat=2')).toEqual('Wikipedia_logo_593.png')
    expect(png('https://webiste.com/Wikipedia_logo_593.png?param1=5&cat=2')).toEqual('Wikipedia_logo_593.png')

    // With anchor
    expect(jpeg('https://website.com/path/to/file.jpeg#someanchor')).toEqual('file.jpeg')
    expect(jpeg('https://website.com/path/to/file.png#someanchor')).toEqual('file.jpeg')
    expect(png('https://website.com/path/to/file.png#someanchor')).toEqual('file.png')
    expect(png('https://website.com/path/to/file.jpeg#someanchor')).toEqual('file.png')

    // With querystring and anchor
    expect(jpeg('https://webiste.com/Wikipedia_logo_593.jpeg?param1=5&cat=2#anchorname')).toEqual('Wikipedia_logo_593.jpeg')
    expect(jpeg('https://webiste.com/Wikipedia_logo_593.jpg?param1=5&cat=2#anchorname')).toEqual('Wikipedia_logo_593.jpeg')
    expect(png('https://webiste.com/Wikipedia_logo_593.png?param1=5&cat=2#anchorname')).toEqual('Wikipedia_logo_593.png')
    expect(png('https://webiste.com/Wikipedia_logo_593.png?param1=5&cat=2#anchorname')).toEqual('Wikipedia_logo_593.png')

    // Error cases
    expect(() => { jpeg('') }).toThrow()
    expect(() => { jpeg('.jpeg') }).toThrow()
  })
})
