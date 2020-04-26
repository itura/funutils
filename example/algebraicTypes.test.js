/* eslint-env jest */

describe('Decomposing an object into a set of algebraic types', () => {
  const records = [
    { total: 1, status: 'ACTIVE' },
    { total: 7, status: 'IDLE' },
    null,
    { subTotal1: 0.5, subTotal2: 0.5, status: 'ACTIVE' },
    undefined
  ]

  describe('Ledger', () => {
    function Ledger (array) {
      this.array = array || []
    }
    Ledger.prototype = {
      calculateTotal: function () {
        let total = 0
        for (const record of this.array) {
          if (record && record.status === 'ACTIVE') {
            if (record.total) {
              total += record.total
            } else {
              total += record.subTotal1 + record.subTotal2
            }
          }
        }
        return total
      }
    }

    it('calculates total of valid active records', () => {
      expect(new Ledger(undefined).calculateTotal()).toEqual(0)
      expect(new Ledger([]).calculateTotal()).toEqual(0)
      expect(new Ledger(records).calculateTotal()).toEqual(2)
    })
  })

  describe('Ledger with algebraic Record types', () => {
    /*
     *  We can refactor the logic to separate the if structure from the loop.
     *  This decreases the complexity of the main loop.
     *
     *  It also allows us to put any type of operation that is specific to a
     *  type of Record in one place, which might be useful if there are lots
     *  of different Records, or if some Records have a lot of rules.
     *
     *  Note that it follows the general form of the "function object" or "command"
     *  patterns, which allow a programmer to create different types of model
     *  objects based on input and then apply them in a consistent way.
     */

    function TotalRecord (value) {
      Object.assign(this, value)
    }
    TotalRecord.prototype = {
      calculateTotal: function () {
        return this.total
      }
    }

    function SubTotalRecord (value) {
      Object.assign(this, value)
    }
    SubTotalRecord.prototype = {
      calculateTotal: function () {
        return this.subTotal1 + this.subTotal2
      }
    }

    function IdleRecord () {}
    IdleRecord.prototype = {
      calculateTotal: () => 0
    }

    const createRecord = data => {
      if (data && data.status === 'ACTIVE') {
        if (data.total) {
          return new TotalRecord(data)
        } else {
          return new SubTotalRecord(data)
        }
      } else {
        return new IdleRecord()
      }
    }

    function Ledger (array) {
      this.array = array || []
    }
    Ledger.prototype = {
      calculateTotal: function () {
        let total = 0
        for (const data of this.array) {
          total += createRecord(data).calculateTotal()
        }
        return total
      }
    }

    it('calculates total of valid active records', () => {
      expect(new Ledger(undefined).calculateTotal()).toEqual(0)
      expect(new Ledger([]).calculateTotal()).toEqual(0)
      expect(new Ledger(records).calculateTotal()).toEqual(2)
    })

    // how to implement this ?
    xit('calculates weighted total of valid active records', () => {
      const result = new Ledger(records).calculateTotal({
        totalFactor: 4,
        subTotalFactor: 2
      })

      expect(result).toEqual(6)
    })

    // and then this ?
    xit('calculates sub total of valid active records', () => {
      const result = new Ledger(records).calculateOnlySubTotals()

      expect(result).toEqual(1)
    })

    /*
     * Note that it is difficult to make any changes to above code without:
     *  a) changing the interface of the entrypoint `calculateTotal`
     *  b) adding additional entrypoints to Ledger
     *
     *  Would every new requirement we introduce to this code require a
     *  new parameter in the main loop, or a new method on the Ledger?
     *  Does this code need to be flexible, but also have a stable interface?
     *
     *  I claim that we should strive for interfaces with a single entrypoint
     *  with few parameters. In light of this claim, let's explore a way to
     *  further decompose the Ledger so that we can express our logic
     *  primarily in terms of operations on the Record type, even
     *  from outside the Ledger.
     */
  })

  describe('Ledger with algebraic Record types and composable calculations', () => {
    /*
     *  This implementation intentionally leans towards a functional style
     *  involving higher-order functions. To help keep track of what's
     *  going on, I've annotated the functions with TypeScript declarations.
     *
     *  In general, we will orient around the RecordOperation<T> type, which
     *  is a function that takes a Record and returns a T.
     *
     *  We will also see Record types get dumbed down to well-defined
     *  containers of information. This does break the object-oriented principle
     *  of encapsulation, but I hope to illustrate the potential benefits of
     *  prioritizing a more functional design.
     */

    /*
     *  interface TotalRecord {
     *    readonly status: string
     *    readonly total: number
     *  }
     */
    function TotalRecord (value) {
      Object.assign(this, value)
    }

    /*
     *  interface SubTotalRecord {
     *    readonly status: string
     *    readonly subTotal1: number
     *    readonly subTotal2: number
     *  }
     */
    function SubTotalRecord (value) {
      Object.assign(this, value)
    }

    /*
     *  interface IdleRecord {
     *    readonly status: string
     *  }
     */
    function IdleRecord () {
      this.status = 'idle'
    }

    /*
     *  type Record = TotalRecord | SubTotalRecord | IdleRecord
     *  declare const createRecord: (data: object) => Record
     */
    const createRecord = data => {
      if (data && data.status === 'ACTIVE') {
        if (data.total) {
          return new TotalRecord(data)
        } else {
          return new SubTotalRecord(data)
        }
      } else {
        return new IdleRecord()
      }
    }

    /*
     *  interface RecordOperation<T> {
     *    (r: Record) => T
     *  }
     *
     *  interface Ledger {
     *    calculateTotal: (operation: RecordOperation<number>) => number
     *  }
     */
    function Ledger (array) {
      this.array = array || []
    }
    Ledger.prototype = {
      calculateTotal: function (operation) {
        let total = 0
        for (const data of this.array) {
          total += operation(createRecord(data))
        }
        return total
      }
    }

    describe('Ledger', () => {
      it('calculates total of valid active records', () => {
        const resultTotal = r => {
          if (r instanceof TotalRecord) {
            return r.total
          }
          if (r instanceof SubTotalRecord) {
            return r.subTotal1 + r.subTotal2
          }
          if (r instanceof IdleRecord) {
            return 0
          }
        }

        expect(new Ledger(undefined).calculateTotal(resultTotal)).toEqual(0)
        expect(new Ledger([]).calculateTotal(resultTotal)).toEqual(0)
        expect(new Ledger(records).calculateTotal(resultTotal)).toEqual(2)
      })
    })

    /*
     *  The Ledger implementation looks nice, but defining the Record operations
     *  is awkward. It seems we have to mirror this if structure in every
     *  operation, so next we'll give ourselves a tool to nicely define Record
     *  logic.
     */

    /*
     *  interface Cases<T> {
     *    readonly total:     RecordOperation<T>
     *    readonly subTotal:  RecordOperation<T>
     *    readonly idle:      RecordOperation<T>
     *  }
     *
     *  declare const caseMap<T>: (cases: Cases<T>) => RecordOperation<T>
     */
    const caseMap = cases => r => {
      if (r instanceof TotalRecord) {
        return cases.total(r)
      }
      if (r instanceof SubTotalRecord) {
        return cases.subTotal(r)
      }
      if (r instanceof IdleRecord) {
        return cases.idle(r)
      }
    }

    describe('caseMap', () => {
      it('invokes the appropriate mapping function based on the type of record', () => {
        const test = caseMap({
          total: () => 'total',
          subTotal: () => 'subTotal',
          idle: () => 'idle'
        })

        expect(test(new TotalRecord())).toEqual('total')
        expect(test(new SubTotalRecord())).toEqual('subTotal')
        expect(test(new IdleRecord())).toEqual('idle')
      })

      it('provides the appropriate record to the invoked mapping function', () => {
        const test = caseMap({
          total: r => r.total,
          subTotal: r => r.subTotal1,
          idle: r => 0
        })

        expect(test(new TotalRecord({ total: 1 }))).toEqual(1)
        expect(test(new SubTotalRecord({ subTotal1: 2 }))).toEqual(2)
        expect(test(new IdleRecord({ total: 3 }))).toStrictEqual(0)
      })
    })

    /*
     *  Now we have a clean way of defining a specific operation across
     *  all the different record types. We can also nicely plug in
     *  new calculations without changing the Ledger interface, as
     *  long as those calculations are expressible in terms of a
     *  single Record.
     */

    /*
     *  declare const calculateTotal: RecordOperation<number>
     */
    const calculateTotal = caseMap({
      total: r => r.total,
      subTotal: r => r.subTotal1 + r.subTotal2,
      idle: r => 0
    })

    it('calculates total of valid active records', () => {
      expect(new Ledger(undefined).calculateTotal(calculateTotal)).toEqual(0)
      expect(new Ledger([]).calculateTotal(calculateTotal)).toEqual(0)
      expect(new Ledger(records).calculateTotal(calculateTotal)).toEqual(2)
    })

    /*
     *  declare const calculateSubTotal: RecordOperation<number>
     */
    const calculateSubTotal = caseMap({
      total: () => 0,
      subTotal: r => r.subTotal1 + r.subTotal2,
      idle: () => 0
    })

    it('calculates sub total of valid active records', () => {
      expect(new Ledger(undefined).calculateTotal(calculateSubTotal)).toEqual(0)
      expect(new Ledger([]).calculateTotal(calculateSubTotal)).toEqual(0)
      expect(new Ledger(records).calculateTotal(calculateSubTotal)).toEqual(1)
    })

    /*
     *  declare const calculateWeightedTotal: RecordOperation<number>
     */
    const calculateWeightedTotal = caseMap({
      total: r => r.total * 4,
      subTotal: r => (r.subTotal1 + r.subTotal2) * 2,
      idle: () => 0
    })

    it('calculates weighted total of valid active records', () => {
      expect(new Ledger(undefined).calculateTotal(calculateWeightedTotal)).toEqual(0)
      expect(new Ledger([]).calculateTotal(calculateWeightedTotal)).toEqual(0)
      expect(new Ledger(records).calculateTotal(calculateWeightedTotal)).toEqual(6)
    })

    /*
     *  Hopefully by now I've demonstrated a couple things:
     *    a) algebraic types can form a basis for different implementation styles
     *    b) inverting the way we express logic involving Records eg
     *          `record.calculateTotal()` => `calculateTotal(record)`
     *       enables a nice way to express calculations that are different for
     *       different Record types
     *
     *  Lastly, I'd like to show that the components we've pulled out of the
     *  ledger are generally compatible with functional implementation styles,
     *  where logic is generally oriented around processing lists of specific
     *  types of things.
     */

    describe('the pieces are easy to repurpose for a functional style', () => {
      /*
       *  declare const sum: (records: object[], operation: RecordOperation<number>) => number
       */
      const sum = (records, operation) =>
        (records || [])
          .map(createRecord)
          .reduce(
            (total, r) => total + operation(r),
            0
          )

      it('calculates total of valid active records', () => {
        expect(sum(undefined, calculateTotal)).toEqual(0)
        expect(sum([], calculateTotal)).toEqual(0)
        expect(sum(records, calculateTotal)).toEqual(2)
      })

      it('calculates sub total of valid active records', () => {
        expect(sum(undefined, calculateSubTotal)).toEqual(0)
        expect(sum([], calculateSubTotal)).toEqual(0)
        expect(sum(records, calculateSubTotal)).toEqual(1)
      })

      it('calculates weighted total of valid active records', () => {
        expect(sum(undefined, calculateWeightedTotal)).toEqual(0)
        expect(sum([], calculateWeightedTotal)).toEqual(0)
        expect(sum(records, calculateWeightedTotal)).toEqual(6)
      })

      it('counts the number of records', () => {
        expect(
          sum(records, caseMap({
            total: () => 1,
            subTotal: () => 1,
            idle: () => 1
          }))
        ).toEqual(5)
      })

      it('counts the number of valid active records', () => {
        expect(
          sum(records, caseMap({
            total: () => 1,
            subTotal: () => 1,
            idle: () => 0
          }))
        ).toEqual(2)
      })
    })
  })
})
