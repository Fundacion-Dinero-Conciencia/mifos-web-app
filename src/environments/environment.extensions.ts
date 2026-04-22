/**
 * This file contains custom environment configuration for the BELAT project.
 * It is imported into the main environment files to minimize the change surface
 * and facilitate upstream updates from Apache Mifos.
 */

const loadedEnv = (window as any)['env'] || {};
const belat = loadedEnv['BELAT'] || {};
const userSync = belat['USER_SYNC'] || {};

export const extensions = {
  userSyncUrl: userSync['URL'] || '',
  /** Feature flag to control whether client data updates are pushed to Keycloak. */
  pushClientDataChangesToKeycloak: userSync['PUSH_CLIENT_DATA_CHANGES_TO_KEYCLOAK'] === 'true'
};
