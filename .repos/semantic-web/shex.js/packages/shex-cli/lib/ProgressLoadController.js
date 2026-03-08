const ProgressLoadControllerCjsModule = function (shexLoader) {

class ProgressLoadController extends shexLoader.ResourceLoadControler {
  add (promise) {
    const index = this.toLoad.length;
    super.add(promise.then(ret => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Loaded ${index} of ${this.schemasSeen.length} imports: ${ret.url}`);
      return ret;
    }));
  }
  allLoaded () {
    return super.allLoaded().then(x => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Loaded ${this.toLoad.length} imports.\n`);
      return x;
    });
  }
}
  return ProgressLoadController;
}

module.exports = ProgressLoadControllerCjsModule;
