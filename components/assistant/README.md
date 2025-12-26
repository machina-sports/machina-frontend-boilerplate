# 🎙️ Guia de Integração: Voice Chat Completion

Este guia descreve como integrar o novo fluxo de **Chat por Voz** no frontend, utilizando o template `voice-chat-completion`.

## 1. Visão Geral

O workflow `voice-chat` permite que o usuário envie uma pergunta em áudio. O sistema realiza a transcrição (Speech-to-Text), busca informações relevantes na base de conhecimento do **Machina Assistant** e retorna a resposta final em texto.

## 2. Passo 1: Upload do Áudio (Google Storage)

O frontend deve capturar o áudio do usuário e enviá-lo como um arquivo binário para o conector de storage.

- **Endpoint:** `POST /connector/executor/{GOOGLE_STORAGE_ID}`
- **Tipo de Envio:** `multipart/form-data`
- **Campos Obrigatórios:**
  - `params[file_path]`: O arquivo binário (Blob ou File).
  - `params[filename]`: **Muito Importante!** O frontend deve enviar um nome com extensão (ex: `pergunta_01.m4a` ou `audio.mp3`). Isso garante que o Google Cloud reconheça o formato corretamente.

**Exemplo de Resposta:**

```json
{
  "status": true,
  "data": {
    "url": "https://storage.googleapis.com/.../static/pergunta_01.m4a",
    "filename": "pergunta_01.m4a"
  }
}
```

## 3. Passo 2: Execução do Voice Chat (Workflow)

Após receber a `url` do Passo 1, o frontend deve disparar o workflow através da API do Machina:

**URL:** `POST /agent/execute/{VOICE_AGENT_ID}`

### Payload de Entrada (JSON)

```json
{
  "inputs": {
    "audio_path": "URL_RECEBIDA_NO_PASSO_1",
    "language_code": "pt-BR"
  }
}
```

## 4. Requisitos de Áudio

Para garantir a melhor performance e compatibilidade com o Google Speech-to-Text:

- **Formatos Suportados:** `.m4a`, `.mp3`, `.wav`, `.flac`.
- **Dica:** Sempre enviem o parâmetro `filename`. Sem ele, o arquivo pode ficar sem extensão no bucket, o que dificulta o processamento posterior.

## 5. Estrutura de Retorno (Output)

A API retornará um objeto contendo a transcrição original e a resposta do agente:

```json
{
  "status": true,
  "data": {
    "transcript": "Como eu crio um novo conector no Machina?",
    "message": "Para criar um novo conector, você deve definir um arquivo YAML na pasta connectors/ e implementar a lógica em Python...",
    "workflow-status": "executed"
  }
}
```

## 6. Variáveis de Ambiente Necessárias

Certifique-se de que as seguintes variáveis de contexto estão configuradas no ambiente Machina:

- `TEMP_CONTEXT_VARIABLE_VERTEX_AI_CREDENTIAL`: Credencial do Google Cloud com permissão para Speech-to-Text.
- `MACHINA_CONTEXT_VARIABLE_GOOGLE_GENERATIVE_AI_API_KEY`: Chave para o Gemini.
- `TEMP_CONTEXT_VARIABLE_SDK_OPENAI_API_KEY`: Chave para gerar os embeddings da busca.

---

Este guia cobre o essencial para o frontend começar a "falar" com o agente.
