# Sincronización de Clientes a Keycloak

Esta extensión permite mantener sincronizados los datos de los clientes entre Mifos (Fineract) y Keycloak. Cuando se actualiza la información de un cliente en la plataforma, los cambios se envían automáticamente a un servicio externo de sincronización para mantener la integridad de los perfiles en ambos sistemas.

## Funcionamiento

La sincronización se realiza de forma diferencial a través del servicio `UserSyncService`. El sistema captura un "snapshot" del estado original del cliente y lo compara con los nuevos datos del formulario, enviando únicamente los campos que han sido modificados (nombre, apellido, email, teléfono, etc.).

- **Servicio Interno:** `UserSyncService`
- **Componente Integrado:** `EditClientComponent` (integrado en el flujo de guardado de edición de clientes).

## Variables de Configuración

Para el correcto funcionamiento de esta extensión, se deben configurar las siguientes variables de entorno. En entornos de contenedores (Docker/Railway), se utiliza la convención de doble guion bajo (`__`) para representar la jerarquía:

| Variable                                                 | Descripción                                                                                      | Valor por Defecto |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :---------------- |
| `BELAT__USER_SYNC__URL`                                  | URL base del servicio de sincronización (ej: `https://user-sync-service.com`).                   | -                 |
| `BELAT__USER_SYNC__PUSH_CLIENT_DATA_CHANGES_TO_KEYCLOAK` | Habilita o deshabilita la sincronización automática. Debe establecerse en `'true'` para activar. | `false`           |

## Consideraciones Técnicas

- La sincronización solo se dispara si el campo `emailAddress` está presente, ya que se utiliza como identificador único en Keycloak.
