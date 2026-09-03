// VERIFY: Automation Rule Management API (api.atlassian.com/automation/public/...)
// is a newer, separately-gated API outside the standard requestJira route helper.
// Forge-native access to it (via api.asApp()) was not confirmed working at build
// time, and it requires the manage:jira-automation scope, which is not enabled in
// manifest.yml. This client is a stub — do not wire it into the dashboard until
// it has been confirmed against a real Forge environment (see README §4.7).

export async function getAutomationRuleStatus() {
  throw new Error(
    'getAutomationRuleStatus is not implemented: Automation Rule Management API access ' +
    'from Forge has not been verified. See README §4.7 before enabling this.'
  );
}
