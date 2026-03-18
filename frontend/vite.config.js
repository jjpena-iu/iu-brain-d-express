import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/iu-brain-backend-d-express/',
})
```

Haz commit → el workflow se activa automáticamente → en ~1 minuto prueba de nuevo la URL:
```
https://jjpena-iu.github.io/iu-brain-backend-d-express/
