# Postman - Gestión Hogar Backend

Archivos incluidos:

- `gestion-hogar-backend.postman_collection.json`
- `gestion-hogar-local.postman_environment.json`

## Importar

1. Abrir Postman.
2. Importar la colección.
3. Importar el environment.
4. Seleccionar el environment `Gestion Hogar Local`.

## Flujo recomendado

1. `Users / Create User (main phone)`
2. `Users / Add Secondary Phone`
3. `Auth / Request Code`
4. `Auth / Verify Code (123456)`
   - Este request guarda automáticamente el JWT en `token`.
5. Ejecutar requests de `Expenses (JWT)`.

## Notas

- Si cambias el número principal, actualiza `mainPhone`.
- Para crear gastos de un número secundario, cambia `expensePhone` por `secondaryPhone`.
- El backend exige JWT en todos los endpoints de `expenses`.
