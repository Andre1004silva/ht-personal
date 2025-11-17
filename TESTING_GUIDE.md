# 📱 Guia de Testes - Como Testar Corretamente

## ❌ Problema: Network Error

**Erro:** `AxiosError: Network Error`

**Causa:** O app está tentando acessar `localhost:3232`, mas:
- `localhost` só funciona na própria máquina
- Dispositivos móveis, Expo Go e navegadores web não conseguem acessar `localhost` do servidor

## ✅ Solução Aplicada

Atualizado o arquivo `config/env.ts` para usar o **IP da sua máquina** ao invés de `localhost`.

**IP da sua máquina:** `192.168.1.9`

---

## 🔧 Pré-requisitos

### 1. Verificar se o Back-end está Rodando

```bash
# No terminal, dentro da pasta HighTraining-BACK
cd /Users/andresilvasantos/Desktop/high-training/HighTraining-BACK
npm start
# ou
node src/server.js
```

**Deve aparecer algo como:**
```
Server is running on port 3232
```

### 2. Verificar se o IP está Correto

```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Deve mostrar: 192.168.1.9
```

### 3. Testar a API pelo IP

```bash
curl http://192.168.1.9:3232/clientes -H "admin_id: 1"
```

**Se retornar dados JSON, está funcionando! ✅**

---

## 📱 Como Testar em Cada Plataforma

### 1. 🌐 Web (Navegador)

**Configuração Atual:** ✅ Já configurado com IP `192.168.1.9`

**Como testar:**
```bash
# No terminal, dentro da pasta personal-front
cd /Users/andresilvasantos/Desktop/high-training/personal-front
npx expo start --web
```

**Acesse:** http://localhost:8081 (ou a porta que o Expo mostrar)

**Status:** ✅ Deve funcionar normalmente

---

### 2. 📱 Expo Go (Dispositivo Físico)

**Configuração Atual:** ✅ Já configurado com IP `192.168.1.9`

**Requisitos:**
- ✅ Celular e computador na **mesma rede Wi-Fi**
- ✅ Back-end rodando em `http://192.168.1.9:3232`
- ✅ App Expo Go instalado no celular

**Como testar:**
```bash
# No terminal, dentro da pasta personal-front
cd /Users/andresilvasantos/Desktop/high-training/personal-front
npx expo start
```

**No celular:**
1. Abra o app **Expo Go**
2. Escaneie o QR Code que aparece no terminal
3. Aguarde o app carregar

**Status:** ✅ Deve funcionar normalmente

---

### 3. 🤖 Emulador Android

**Configuração Atual:** ⚠️ Pode precisar ajuste

**Opção 1: Usar IP da máquina (Recomendado)**
- ✅ Já configurado: `http://192.168.1.9:3232`
- Funciona se o emulador estiver em modo bridge

**Opção 2: Usar IP especial do Android**
- Se não funcionar, altere para: `http://10.0.2.2:3232`
- `10.0.2.2` é o IP que o emulador Android usa para acessar o localhost da máquina host

**Como testar:**
```bash
# Inicie o emulador Android primeiro
# Depois, no terminal:
cd /Users/andresilvasantos/Desktop/high-training/personal-front
npx expo start --android
```

---

### 4. 🍎 Simulador iOS

**Configuração Atual:** ✅ Já configurado com IP `192.168.1.9`

**Como testar:**
```bash
# No terminal, dentro da pasta personal-front
cd /Users/andresilvasantos/Desktop/high-training/personal-front
npx expo start --ios
```

**Status:** ✅ Deve funcionar normalmente

---

## 🔍 Troubleshooting

### Problema 1: Ainda dá Network Error

**Possíveis causas:**

1. **Back-end não está rodando**
   ```bash
   # Verifique se está rodando
   curl http://192.168.1.9:3232/clientes -H "admin_id: 1"
   ```

2. **Firewall bloqueando**
   - Mac: Vá em Preferências do Sistema > Segurança > Firewall
   - Permita conexões para Node.js

3. **Dispositivos em redes diferentes**
   - Celular e computador devem estar na **mesma rede Wi-Fi**
   - Não use VPN

4. **IP mudou**
   ```bash
   # Verifique o IP atual
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Se mudou, atualize em config/env.ts
   ```

### Problema 2: CORS Error

**Solução:** Já está configurado no back-end
```javascript
// HighTraining-BACK/src/server.js
app.use(cors()); // Permite todas as origens
```

### Problema 3: Timeout

**Solução:** Aumentar o timeout
```typescript
// config/env.ts
API_TIMEOUT: 30000, // 30 segundos
```

---

## 🧪 Testes de Verificação

### 1. Testar Conexão Básica

```bash
# Teste 1: Pelo localhost (só funciona na máquina)
curl http://localhost:3232/clientes -H "admin_id: 1"

# Teste 2: Pelo IP (funciona em todos os dispositivos)
curl http://192.168.1.9:3232/clientes -H "admin_id: 1"
```

### 2. Testar Criação de Cliente

```bash
curl -X POST http://192.168.1.9:3232/clientes \
  -H "admin_id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste App",
    "email": "teste@app.com",
    "phone_number": "+55 11 99999-9999",
    "date_of_birth": "1990-01-01",
    "gender": "masculino"
  }'
```

### 3. Testar no Navegador

Abra o navegador e acesse:
```
http://192.168.1.9:3232/clientes
```

**Deve mostrar:** JSON com a lista de clientes

---

## 📋 Checklist de Testes

Antes de testar no app, verifique:

- [ ] Back-end está rodando na porta 3232
- [ ] Consegue acessar `http://192.168.1.9:3232/clientes` no navegador
- [ ] CURL retorna dados: `curl http://192.168.1.9:3232/clientes -H "admin_id: 1"`
- [ ] Celular e computador na mesma rede Wi-Fi (para Expo Go)
- [ ] Firewall não está bloqueando a porta 3232
- [ ] Arquivo `config/env.ts` tem o IP correto: `192.168.1.9`

---

## 🔄 Como Reiniciar se Algo Der Errado

### 1. Reiniciar Back-end
```bash
cd /Users/andresilvasantos/Desktop/high-training/HighTraining-BACK
# Ctrl+C para parar
npm start
```

### 2. Reiniciar Front-end
```bash
cd /Users/andresilvasantos/Desktop/high-training/personal-front
# Ctrl+C para parar
npx expo start --clear
```

### 3. Limpar Cache do Expo
```bash
cd /Users/andresilvasantos/Desktop/high-training/personal-front
npx expo start --clear
# ou
rm -rf .expo node_modules
npm install
npx expo start
```

---

## 📱 Testando Funcionalidades

### Teste 1: Listar Clientes
1. Abra o app
2. Vá para a tela "Alunos"
3. Deve carregar e mostrar os clientes do banco

### Teste 2: Criar Cliente
1. Na tela "Alunos"
2. Clique no botão flutuante (+)
3. Preencha os dados
4. Clique em "Salvar"
5. Deve voltar para a lista com o novo cliente

### Teste 3: Editar Cliente
1. Na tela "Alunos"
2. Clique em um cliente
3. Clique em "Editar"
4. Modifique algum campo
5. Clique em "Salvar"
6. Deve atualizar os dados

### Teste 4: Excluir Cliente
1. Na tela "Alunos"
2. Clique em um cliente
3. Clique em "Excluir"
4. Confirme
5. Deve remover da lista

---

## 🎯 Configuração Atual

```typescript
// config/env.ts
export const ENV = {
  API_URL: __DEV__ 
    ? 'http://192.168.1.9:3232' // ✅ Configurado
    : 'https://sua-api-producao.com',
  API_TIMEOUT: 10000,
  API_VERSION: 'v1',
};
```

**Status:** ✅ Configurado corretamente para testes

---

## 📞 Comandos Úteis

### Descobrir IP da Máquina
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### Verificar Porta em Uso
```bash
# Mac/Linux
lsof -i :3232

# Windows
netstat -ano | findstr :3232
```

### Testar Conectividade
```bash
# Ping no IP
ping 192.168.1.9

# Testar porta específica
nc -zv 192.168.1.9 3232
```

---

## ✅ Resumo

**O que foi feito:**
1. ✅ Descoberto o IP da máquina: `192.168.1.9`
2. ✅ Atualizado `config/env.ts` para usar o IP
3. ✅ Testado que o servidor está acessível pelo IP
4. ✅ Verificado que CORS está configurado

**Agora você pode testar:**
- ✅ Web (navegador)
- ✅ Expo Go (celular físico)
- ✅ Simulador iOS
- ⚠️ Emulador Android (pode precisar usar `10.0.2.2`)

**Próximos passos:**
1. Reinicie o app Expo
2. Teste criar um cliente
3. Se funcionar, está tudo certo! 🎉

---

**Última atualização:** 07/11/2025  
**IP da máquina:** 192.168.1.9  
**Porta do back-end:** 3232
