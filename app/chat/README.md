# Página de Chat Dedicada

Esta é uma página dedicada para o chat do assistente Machina, inspirada em interfaces como ChatGPT, com funcionalidades avançadas de personalização e controle.

## Funcionalidades

### 🎨 Personalização Visual

- **Temas**: Alterne entre claro, escuro ou automático (sistema)
- **Layouts**: Escolha entre padrão, compacto ou confortável
- **Tamanho da fonte**: Ajustável entre 12-20px
- **Timestamps**: Mostrar/ocultar horários das mensagens
- **Avatares**: Mostrar/ocultar avatares dos participantes

### 🖥️ Controles de Visualização

- **Fullscreen**: Entre em modo tela cheia para uma experiência imersiva
- **Sidebar**: Toggle da barra lateral com histórico de conversas
- **Responsivo**: Interface adaptável para desktop, tablet e mobile

### 📱 Responsividade

- **Desktop**: Layout completo com sidebar fixa
- **Mobile**: Sidebar em overlay, controles otimizados para toque
- **Tablet**: Experiência híbrida adaptada

### 🔄 Gerenciamento de Estado

Toda a configuração da UI é gerenciada pelo Redux Toolkit:

- Estado persistente entre navegações
- Sincronização automática entre componentes
- Fácil integração com outras funcionalidades

## Estrutura de Arquivos

```
app/chat/
├── page.tsx              # Página principal
├── chat-page.css        # Estilos e animações
└── README.md            # Esta documentação

components/chat-page/
├── chat-controls.tsx    # Controles de visualização
└── chat-sidebar.tsx     # Barra lateral com histórico

providers/chat-ui/
└── reducer.ts           # Redux slice para estado da UI
```

## Componentes

### ChatControls

Barra de controles com botões para:

- Toggle da sidebar
- Seletor de tema
- Seletor de layout
- Toggle fullscreen

### ChatSidebar

Barra lateral com:

- Botão para nova conversa
- Lista de conversas anteriores
- Timestamps das conversas
- Ações (deletar, etc)

## Uso do Redux

```typescript
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleFullscreen, setTheme } from '@/providers/chat-ui/reducer';

// Ler estado
const { isFullscreen, theme } = useAppSelector((state) => state.chatUI);

// Despachar ações
dispatch(toggleFullscreen());
dispatch(setTheme('dark'));
```

## Navegação

O botão flutuante nas outras páginas agora redireciona para `/chat`.
Na página do chat, o botão flutuante não é exibido.

## Animações

Todas as transições são suaves e configuradas via CSS:

- Entrada/saída da sidebar
- Fade in do conteúdo
- Hover effects nos botões
- Transições de tema

## Próximos Passos

- [ ] Integrar com histórico real de conversas
- [ ] Adicionar busca nas conversas
- [ ] Implementar categorização de chats
- [ ] Adicionar atalhos de teclado
- [ ] Exportar conversas
- [ ] Compartilhamento de conversas
