/*
  Override ShExApp.getValidator with a RemoteShExValidator
 */
class ShExInWorkerApp extends ShExApp {
  getValidator (loaded, base, inputData) {
    return new RemoteShExValidator(loaded, base, inputData, this.makeRenderer(), this.disableResultsAndValidate.bind(this), "endpoint" in this.Caches.inputData ? this.Caches.inputData.endpoint : null, "ShExWorkerThread.js")
  }
}
 
