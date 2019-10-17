import * as _ from 'lodash'

const Notify = {}

const workInProgressNotificationId = 'sifty-working'
const workCompleteNotificationId = 'sifty-finished'

Notify.workInProgress = function (numItemsInProgress) {
  const id = workInProgressNotificationId
  const message = `Downloading ${numItemsInProgress} files...`
  createNotification(id, message)
}

Notify.workComplete = function (numItemsCompleted) {
  clearWorkInProgressNotification()
  let message = ''
  if (numItemsCompleted > 0) {
    message = `Done! (${numItemsCompleted} saved)`
  } else {
    message = 'No media files to download'
  }
  createWorkCompleteNotification(message)
}

function clearWorkInProgressNotification () {
  clearNotification(workInProgressNotificationId)
}

function createWorkCompleteNotification (message) {
  const id = workCompleteNotificationId
  const timeoutInMs = 2000
  createNotificationWithTimeout(id, message, timeoutInMs)
}

function createNotification (id, message) {
  browser.notifications.create(id, {
    title: 'Save Items From Tabs, Yo!',
    iconUrl: browser.extension.getURL('icons/sifty.svg'),
    type: 'basic',
    message: message
  })
}

function createNotificationWithTimeout (id, message, timeoutInMs) {
  throwIfTimeoutInvalid(timeoutInMs)
  createNotification(id, message)
  setTimeout(() => { clearNotification(id) }, timeoutInMs)
}

function clearNotification (id) {
  browser.notifications.clear(id)
}

function throwIfTimeoutInvalid (timeoutInMs) {
  if (timeoutIsInvalid(timeoutInMs)) {
    throw new Error('Invalid timeout.')
  }
}

function timeoutIsInvalid (timeoutInMs) {
  return _.isNil(timeoutInMs) || timeoutInMs <= 0
}

export default Notify
