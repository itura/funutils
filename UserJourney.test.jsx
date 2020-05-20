/* eslint-env jest */

import { render } from '@testing-library/react'
require('regenerator-runtime/runtime')
const React = require('react')
const UserJourney = require('./UserJourney')

describe('UserJourney', () => {
  const queryOpts = [{
    selector: 'p'
  }, {
    timeout: 20,
    interval: 10
  }]

  it('executes a single step', done => {
    const page = render(<p>hi</p>)

    UserJourney(page, done.fail)
      .step('step 1', async () => {
        await page.findByText('hi', ...queryOpts)
      })
      .run()
      .then(done)
  })

  it('executes many steps', done => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    UserJourney(page, done.fail)
      .step('step 1', async () => {
        await page.findByText('hi', ...queryOpts)
      })
      .step('step 2', async () => {
        await page.findByText('bye', ...queryOpts)
      })
      .run()
      .then(done)
  })

  it('calls the fail and log functions when an error occurs', async () => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    const fail = e => {
      throw e
    }
    const log = jest.fn()
    await UserJourney(page, fail, { log })
      .step('step 1', async () => {
        await page.findByText('hi', ...queryOpts)
      })
      .step('step 2', async () => {
        page.getByText('hi!!!!!!!')
      })
      .step('step 3', async () => {
        page.getByText('hi!!!!!!!')
      })
      .step('step 4', async () => {
        await page.findByText('bye', ...queryOpts)
      })
      .run()
      .catch(e => {
        expect(e.message).toContain('Unable to find an element with the text: hi!!!!!!!')
      })

    expect(log).toHaveBeenCalledWith('Error in "step 2"')
    expect(log).toHaveBeenCalledTimes(1)
  })

  it('passes the page object to each step', done => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    UserJourney(page, done.fail)
      .step('step 1', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .step('step 2', async p => {
        await p.findByText('bye', ...queryOpts)
      })
      .run()
      .then(done)
  })

  it('can be disabled and enabled to skip steps', async () => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    const fail = e => {
      throw e
    }
    const log = jest.fn()
    await UserJourney(page, fail, { log })
      .step('step 1', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .disable()
      .step('step 2', async p => {
        p.getByText('bye!!!!')
      })
      .enable()
      .step('step 3', async p => {
        await p.findByText('o noes!!', ...queryOpts)
      })
      .run()
      .catch(e => {
        expect(e.message).toContain('Unable to find an element with the text: o noes!!')
      })

    expect(log).toHaveBeenCalledWith('Error in "step 3"')
    expect(log).toHaveBeenCalledTimes(1)
  })

  it('has default aliases for steps', async done => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    await UserJourney(page, done.fail)
      .given('displays hi', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .when('displays hi', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .then('displays hi', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .and('displays bye', async p => {
        await p.findByText('bye', ...queryOpts)
      })
      .describe('displays bye', async p => {
        await p.findByText('bye', ...queryOpts)
      })
      .it('displays bye', async p => {
        await p.findByText('bye', ...queryOpts)
      })
      .run()

    done()
  })

  it('has configurable aliases for steps', async done => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    await UserJourney(page, done.fail, {
      aliases: ['beep', 'boop'],
      additionalAliases: ['blorp']
    })
      .beep('displays hi', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .boop('displays hi', async p => {
        await p.findByText('hi', ...queryOpts)
      })
      .blorp('displays bye', async p => {
        await p.findByText('bye', ...queryOpts)
      })
      .run()

    done()
  })

  it('can be composed', async () => {
    const page = render(
      <div>
        <p>hi</p>
        <p>bye</p>
      </div>
    )

    const fail = e => {
      throw e
    }
    const log = jest.fn()
    const journey1 = UserJourney(page, fail, { log })
      .step('step 1', async p => {
        await p.findByText('hi', ...queryOpts)
      })

    await journey1
      .run()

    const journey2 = journey1
      .step('step 2', async p => {
        await p.findByText('bye', ...queryOpts)
      })
      .step('step 3', async p => {
        p.getByText('o noes!!')
      })

    await journey2
      .run()
      .catch(e => {
        expect(e.message).toContain('Unable to find an element with the text: o noes!!')
      })

    expect(log).toHaveBeenCalledWith('Error in "step 3"')
    expect(log).toHaveBeenCalledTimes(1)
    log.mockClear()

    const withJourney = journey => value => journey
      .step(`step ${value}`, async p => {
        await p.findByText(value, ...queryOpts)
      })

    const journeyFor = withJourney(UserJourney(page, fail, { log }))

    const journey3 = journeyFor('hi')
    const journey4 = journeyFor('bye')
    const journey5 = journeyFor('o noes!!')

    await journey3.run()
    await journey4.run()
    await journey5
      .run()
      .catch(e => {
        expect(e.message).toContain('Unable to find an element with the text: o noes!!')
      })

    expect(log).toHaveBeenCalledWith('Error in "step o noes!!"')
    expect(log).toHaveBeenCalledTimes(1)
    log.mockClear()

    const initialJourney = UserJourney(page, fail, { log })
    const checkForValue = (journey, value) => journey
      .step(`step ${value}`, async p => {
        await p.findByText(value, ...queryOpts)
      })

    await ['hi', 'bye', 'o noes!!', 'o great']
      .reduce(checkForValue, initialJourney)
      .run()
      .catch(e => {
        expect(e.message).toContain('Unable to find an element with the text: o noes!!')
      })

    expect(log).toHaveBeenCalledWith('Error in "step o noes!!"')
    expect(log).toHaveBeenCalledTimes(1)
    log.mockClear()
  })
})
