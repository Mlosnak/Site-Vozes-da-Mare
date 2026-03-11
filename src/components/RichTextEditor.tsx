import { useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Undo,
  Redo
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  useEffect(() => {
    if (editorRef.current && !isInitialized.current && value) {
      editorRef.current.innerHTML = value;
      isInitialized.current = true;
    }
  }, [value]);
  useEffect(() => {
    if (editorRef.current && value === "" && isInitialized.current) {
      editorRef.current.innerHTML = "";
      isInitialized.current = false;
    }
  }, [value]);

  const execCommand = useCallback((command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString();
    const url = prompt("Digite a URL do link:", "https://");
    if (url && url !== "https://") {
      if (selectedText) {
        execCommand("createLink", url);
        if (editorRef.current) {
          const links = editorRef.current.querySelectorAll('a');
          links.forEach(link => {
            if (link.href === url || link.getAttribute('href') === url) {
              link.style.color = '#e4142c';
              link.style.textDecoration = 'underline';
              link.setAttribute('target', '_blank');
            }
          });
          onChange(editorRef.current.innerHTML);
        }
      } else {
        const linkText = prompt("Digite o texto do link:");
        if (linkText) {
          const linkHtml = `<a href="${url}" target="_blank" style="color: #e4142c; text-decoration: underline;">${linkText}</a>`;
          execCommand("insertHTML", linkHtml);
        }
      }
    }
  }, [execCommand, onChange]);

  const insertImage = useCallback(() => {
    const url = prompt("Digite a URL da imagem:");
    if (url) {
      execCommand("insertImage", url);
    }
  }, [execCommand]);

  const formatBlock = useCallback((tag: string) => {
    execCommand("formatBlock", tag);
  }, [execCommand]);

  const toolbarButtons = [
    { icon: Undo, action: () => execCommand("undo"), title: "Desfazer" },
    { icon: Redo, action: () => execCommand("redo"), title: "Refazer" },
    { type: "separator" },
    { icon: Bold, action: () => execCommand("bold"), title: "Negrito (Ctrl+B)" },
    { icon: Italic, action: () => execCommand("italic"), title: "Itálico (Ctrl+I)" },
    { icon: Underline, action: () => execCommand("underline"), title: "Sublinhado (Ctrl+U)" },
    { icon: Highlighter, action: () => execCommand("hiliteColor", "#fef08a"), title: "Destacar" },
    { type: "separator" },
    { icon: Heading1, action: () => formatBlock("h2"), title: "Título Grande" },
    { icon: Heading2, action: () => formatBlock("h3"), title: "Título Médio" },
    { type: "separator" },
    { icon: List, action: () => execCommand("insertUnorderedList"), title: "Lista" },
    { icon: ListOrdered, action: () => execCommand("insertOrderedList"), title: "Lista Numerada" },
    { icon: Quote, action: () => formatBlock("blockquote"), title: "Citação" },
    { type: "separator" },
    { icon: AlignLeft, action: () => execCommand("justifyLeft"), title: "Alinhar à Esquerda" },
    { icon: AlignCenter, action: () => execCommand("justifyCenter"), title: "Centralizar" },
    { icon: AlignRight, action: () => execCommand("justifyRight"), title: "Alinhar à Direita" },
    { type: "separator" },
    { icon: LinkIcon, action: insertLink, title: "Inserir Link" },
    { icon: ImageIcon, action: insertImage, title: "Inserir Imagem" },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b border-border">
        {toolbarButtons.map((btn, index) => {
          if (btn.type === "separator") {
            return <div key={index} className="w-px h-6 bg-border mx-1" />;
          }
          const Icon = btn.icon!;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={btn.action}
              title={btn.title}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none
          prose-headings:text-foreground prose-headings:font-bold
          prose-p:text-foreground prose-p:my-2
          prose-a:text-primary prose-a:underline
          prose-strong:text-foreground
          prose-em:text-foreground
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:my-2 prose-blockquote:rounded-r
          prose-ul:my-2 prose-ol:my-2
          prose-li:text-foreground
          prose-img:rounded-lg prose-img:max-w-full prose-img:my-4
          [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_mark]:rounded"
        data-placeholder={placeholder}
        style={{ 
          minHeight: '300px',
          wordBreak: 'break-word'
        }}
      />

      <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground">
        <span className="font-medium">Dicas:</span> Use Ctrl+B para negrito, Ctrl+I para itálico, Ctrl+U para sublinhado
      </div>
    </div>
  );
}
