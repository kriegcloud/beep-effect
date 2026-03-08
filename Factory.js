import combine from './combine.js'
import concat from './concat.js'
import count from './count.js'
import distinct from './distinct.js'
import exists from './exists.js'
import fallback from './fallback.js'
import fixed from './fixed.js'
import language from './language.js'
import pageRank from './pageRank.js'
import pathDepth from './pathDepth.js'
import prioritized from './prioritized.js'
import product from './product.js'
import scale from './scale.js'
import sort from './sort.js'
import sortObjects from './sortObjects.js'
import sum from './sum.js'
import type from './type.js'

class Factory {
  init () {
    this.score = {
      combine,
      concat,
      count,
      distinct,
      exists,
      fallback,
      fixed,
      language,
      pageRank,
      pathDepth,
      prioritized,
      product,
      scale,
      sort,
      sortObjects,
      sum,
      type
    }
  }
}

export default Factory
