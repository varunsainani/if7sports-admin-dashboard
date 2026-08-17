# Despliegue

## Enlace de revisión

https://if7sports-admin-dashboard.vercel.app

## Cómo se despliega

El proyecto de Vercel `varunprojects/if7sports-admin-dashboard` está conectado al
repositorio `varunsainani/if7sports-admin-dashboard`. Cada push a `main` lanza un
despliegue de producción automáticamente.

Un detalle importante: la aplicación no está en la raíz del repositorio, sino en
`source-code/`. El ajuste **Root Directory** del proyecto está fijado a
`source-code` por ese motivo. Sin él, la compilación busca el `package.json` en la
raíz y falla.

## Despliegue manual

Si hiciera falta desplegar sin pasar por Git:

```bash
cd source-code
npx vercel --prod
```

## Verificación

Auto-despliegue comprobado: el push del commit `b37a8aa` generó el despliegue de
producción `git:main@b37a8aa` y quedó en estado READY.
