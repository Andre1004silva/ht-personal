# ⚠️ IP da Máquina Mudou

## O Problema

O Expo Go não conseguia buscar dados porque o IP da sua máquina mudou:
- **IP antigo:** `192.168.1.9`
- **IP novo:** `192.168.1.13`

## ✅ Correção Aplicada

Atualizei o arquivo `config/env.ts` com o novo IP:

```typescript
// Linha 25
return 'http://192.168.1.13:3232';
```

## 🚀 Próximos Passos

### **1. Reinicie o Expo (OBRIGATÓRIO)**

```bash
# Pare o servidor (Ctrl+C) e reinicie:
npm start
```

### **2. Escaneie o QR Code Novamente**

O QR code antigo não vai funcionar porque tinha o IP antigo. Você precisa:
1. Fechar o app no Expo Go
2. Escanear o novo QR code
3. Testar a tela de Alunos

### **3. Teste a Conexão**

Antes de testar no celular, confirme que a API está acessível:

```bash
curl http://192.168.1.13:3232/clientes -H "admin_id: 1"
```

Se retornar JSON com os clientes, está tudo certo! ✅

---

## 🔄 Para o Futuro

### **Quando o IP Mudar Novamente**

O IP pode mudar quando você:
- Reconecta ao Wi-Fi
- Reinicia o computador/roteador
- Muda de rede

### **Solução Rápida: Script Automático**

Criei um script que detecta e atualiza o IP automaticamente:

```bash
cd personal-front
./update-ip.sh
```

O script vai:
1. ✅ Detectar seu IP atual
2. ✅ Atualizar o arquivo `config/env.ts`
3. ✅ Mostrar o que fazer em seguida

### **Solução Manual**

Se preferir fazer manualmente:

```bash
# 1. Descubra seu IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Edite config/env.ts:
# Linha 25: return 'http://SEU_IP:3232';

# 3. Reinicie o Expo:
npm start
```

---

## 📱 Checklist Rápido

Antes de testar no Expo Go:

- [x] Back-end rodando em `0.0.0.0:3232`
- [x] IP atualizado para `192.168.1.13`
- [ ] **Expo reiniciado** (npm start)
- [ ] **Novo QR code escaneado**
- [ ] Celular na mesma rede Wi-Fi
- [ ] Teste: `curl http://192.168.1.13:3232/clientes -H "admin_id: 1"`

---

## 🎯 Resumo

**Problema:** IP mudou de `.9` para `.13`  
**Solução:** Atualizado em `config/env.ts`  
**Ação:** Reinicie o Expo e escaneie o novo QR code  
**Futuro:** Use `./update-ip.sh` quando o IP mudar
