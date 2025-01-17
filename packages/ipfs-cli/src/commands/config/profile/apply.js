import JSONDiff from 'jsondiffpatch'
import parseDuration from 'parse-duration'

export default {
  command: 'apply <profile>',

  describe: 'Apply profile to config',

  builder: {
    'dry-run': {
      type: 'boolean',
      describe: 'print difference between the current config and the config that would be generated.',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {string} argv.profile
   * @param {boolean} argv.dryRun
   * @param {number} argv.timeout
   */
  async handler ({ ctx, profile, dryRun, timeout }) {
    const { print, ipfs, isDaemon } = ctx
    const diff = await ipfs.config.profiles.apply(profile, {
      dryRun,
      timeout
    })
    const delta = JSONDiff.diff(diff.original, diff.updated)
    const res = delta && JSONDiff.formatters.console.format(delta, diff.original)

    if (res) {
      print(res)

      if (isDaemon) {
        print('\nThe IPFS daemon is running in the background, you may need to restart it for changes to take effect.')
      }
    } else {
      print(`IPFS config already contains the settings from the '${profile}' profile`)
    }
  }
}
