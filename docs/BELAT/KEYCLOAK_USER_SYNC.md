# Sincronización de Clientes a Keycloak

Esta extensión permite mantener sincronizados los datos de los clientes entre Mifos (Fineract) y Keycloak. Existen dos escenarios principales de sincronización: la creación de nuevos usuarios y la actualización de usuarios existentes.

## Escenarios de Sincronización

La lógica de sincronización se centraliza en el servicio `UserSyncService`, el cual es invocado desde distintos módulos de la aplicación según la acción realizada.

### 1. Creación de Clientes

Cuando se registra un nuevo cliente en la plataforma, el sistema notifica automáticamente al servicio de sincronización para dar de alta al usuario en Keycloak e iniciar el flujo de bienvenida (verificación de email y establecimiento de contraseña).

- **Componente:** `CreateClientComponent`
- **Endpoint:** `POST /keycloak/create/user`
- **Requerimientos de Campos:**
  | Campo | Origen en Fineract | Requerido |
  | :--- | :--- | :--- |
  | `username` | `emailAddress` | Sí |
  | `email` | `emailAddress` | Sí |
  | `firstname` | `firstname` o `fullname` | Sí |
  | `lastname` | `lastname` | Sí |
  | `fineract_id` | `resourceId` (ID generado) | Sí |
  | `country` | `tenantIdentifier` (Tenant activo) | Sí |
  | `phone` | `mobileNo` | No |

### 2. Actualización de Clientes

Cuando se modifica la información de un cliente existente, el sistema realiza una sincronización diferencial. Captura un "snapshot" del estado original y lo compara con los nuevos datos, enviando únicamente los campos que han cambiado.

- **Componente:** `EditClientComponent`
- **Endpoint:** `POST /keycloak/update/user/{username}`
- **Campos Sincronizados (Diferenciales):**
  | Campo | Atributo Keycloak |
  | :--- | :--- |
  | `firstname` | `firstName` |
  | `lastname` | `lastName` |
  | `emailAddress` | `email` |
  | `mobileNo` | `phone` |
  | `externalId` | `external_id` |

## Variables de Configuración

Para el correcto funcionamiento de esta extensión, se deben configurar las siguientes variables de entorno. Se utiliza la convención de doble guion bajo (`__`) para representar la jerarquía:

| Variable                                                 | Descripción                                                                                      | Valor por Defecto |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :---------------- |
| `BELAT__USER_SYNC__URL`                                  | URL base del servicio de sincronización (ej: `https://user-sync-service.com`).                   | -                 |
| `BELAT__USER_SYNC__PUSH_CLIENT_DATA_CHANGES_TO_KEYCLOAK` | Habilita o deshabilita la sincronización automática. Debe establecerse en `'true'` para activar. | `false`           |

## Consideraciones Técnicas

- **Validación:** En el escenario de creación, si falta algún campo obligatorio (todos excepto `phone`), la sincronización se omite y se registra un log de depuración.
- **Identificador:** El campo `emailAddress` es fundamental en ambos escenarios, ya que se utiliza como identificador único para vincular las cuentas entre Mifos y Keycloak.
