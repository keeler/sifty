import MimeType from '../../core/mimeType'

// For linter to be quiet.
/* global describe, afterEach, it, expect */

describe('Mime type management works:', () => {
  it('Check supported mime types', () => {
    expect(MimeType.isSupported('image/jpeg')).toEqual(true)
    expect(MimeType.isSupported('image/gif')).toEqual(true)
    expect(MimeType.isSupported('image/png')).toEqual(true)
    expect(MimeType.isSupported('video/mp4')).toEqual(true)
    expect(MimeType.isSupported('video/webm')).toEqual(true)

    expect(MimeType.isSupported('video')).toEqual(false)
    expect(MimeType.isSupported('webm')).toEqual(false)
    expect(MimeType.isSupported('')).toEqual(false)
    expect(MimeType.isSupported('image/jif')).toEqual(false)
  })

  it('Mime types get expected extensions', async () => {
    expect(MimeType.getFileExtension('image/jpeg')).toEqual('jpeg')
    expect(MimeType.getFileExtension('image/gif')).toEqual('gif')
    expect(MimeType.getFileExtension('image/png')).toEqual('png')
    expect(MimeType.getFileExtension('video/mp4')).toEqual('mp4')
    expect(MimeType.getFileExtension('video/webm')).toEqual('webm')
  })
})
