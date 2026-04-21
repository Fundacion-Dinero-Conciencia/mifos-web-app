/**
 * This file contains custom environment configuration for the BELAT project.
 * It is imported into the main environment files to minimize the change surface
 * and facilitate upstream updates from Apache Mifos.
 */

const loadedEnv = (window as any)['env'] || {};

export const extensions = {
  userSyncUrl: loadedEnv['userSyncUrl'] || 'https://fineract-mifos-dev.up.railway.app',
  /** Feature flag to control whether client data updates are pushed to Keycloak.
   *  Set to 'true' in env.js to enable. */
  pushClientDataChangesToKeycloak:
    loadedEnv['pushClientDataChangesToKeycloak'] === 'true' || loadedEnv['pushClientDataChangesToKeycloak'] === true
};
