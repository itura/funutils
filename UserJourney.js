const { chainP } = require('./common')

const UserJourney = (page, onFail, config = {}) => {
  const steps = config.steps || []
  const disabled = config.disabled || false
  const log = config.log || console.log
  const aliases = config.aliases || [
    'describe', 'it', 'given', 'when', 'then', 'and'
  ]
  const additionalAliases = config.additionalAliases || []

  const step = (description, action) => {
    return UserJourney(page, onFail, {
      ...config,
      steps: disabled
        ? steps
        : steps.concat({ description, action })
    })
  }

  const disable = () => {
    return UserJourney(page, onFail, {
      ...config,
      disabled: true
    })
  }

  const enable = () => {
    return UserJourney(page, onFail, {
      ...config,
      disabled: false
    })
  }

  const run = () => {
    return chainP()(
      ...steps.map(({ description, action }) =>
        () => action(page).catch(e => {
          log(`Error in "${description}"`)
          onFail(e)
        })
      )
    )
  }

  const stepAliases = aliases
    .concat(additionalAliases)
    .map(alias => ({ [alias]: step }))

  return Object.assign(
    ...stepAliases,
    { step, disable, enable, run }
  )
}

module.exports = UserJourney
