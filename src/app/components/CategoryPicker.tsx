import { useState } from 'react';
import { ChevronRight, ArrowLeft, Check, Tag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { categoryTree, type CategoryNode } from '../lib/data';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [stack, setStack] = useState<CategoryNode[]>([]); // breadcrumb stack

  const currentNode: CategoryNode | null = stack.length > 0 ? stack[stack.length - 1] : null;
  const currentChildren = currentNode ? currentNode.subcategories ?? [] : categoryTree;

  const currentPath = stack.map(n => n.name).join(' > ');

  function handleSelect(node: CategoryNode) {
    const path = currentPath ? `${currentPath} > ${node.name}` : node.name;
    if (node.subcategories?.length) {
      setStack([...stack, node]);
    } else {
      onChange(path);
      setOpen(false);
      setStack([]);
    }
  }

  function handleSelectCurrent() {
    onChange(currentPath);
    setOpen(false);
    setStack([]);
  }

  function handleBack() {
    setStack(stack.slice(0, -1));
  }

  function handleOpen() {
    // Pre-navigate to the right parent if value is already set
    if (value && value !== 'Annet') {
      const parts = value.split(' > ');
      if (parts.length > 1) {
        // find parent nodes
        const nodes: CategoryNode[] = [];
        let children = categoryTree;
        for (let i = 0; i < parts.length - 1; i++) {
          const found = children.find(n => n.name === parts[i]);
          if (found) {
            nodes.push(found);
            children = found.subcategories ?? [];
          } else break;
        }
        setStack(nodes);
      } else {
        setStack([]);
      }
    } else {
      setStack([]);
    }
    setOpen(true);
  }

  // Display value: shorten long paths
  const displayValue = value
    ? value.split(' > ').length > 1
      ? `${value.split(' > ')[0]} › ${value.split(' > ').slice(1).join(' › ')}`
      : value
    : 'Velg kategori';

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 bg-input-background rounded-xl text-sm text-left hover:bg-muted transition-colors"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 rounded-t-2xl">
          {/* Header */}
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {stack.length > 0 && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full h-8 w-8 shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="min-w-0">
                <SheetTitle className="text-base text-left truncate">
                  {stack.length === 0 ? 'Velg kategori' : currentNode!.name}
                </SheetTitle>
                {stack.length > 1 && (
                  <p className="text-xs text-muted-foreground truncate">
                    {stack.slice(0, -1).map(n => n.name).join(' › ')}
                  </p>
                )}
              </div>
            </div>
          </SheetHeader>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {/* "Select this level" option when inside a parent */}
            {currentNode && (
              <button
                type="button"
                onClick={handleSelectCurrent}
                className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Velg «{currentNode.name}»</span>
                </div>
                {value === currentPath && <Check className="h-4 w-4 text-primary" />}
              </button>
            )}

            {currentChildren.map(node => {
              const nodePath = currentPath ? `${currentPath} > ${node.name}` : node.name;
              const isSelected = value === nodePath;
              return (
                <button
                  key={node.name}
                  type="button"
                  onClick={() => handleSelect(node)}
                  className={`w-full flex items-center justify-between px-4 py-4 border-b border-border transition-colors ${
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted'
                  }`}
                >
                  <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {node.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                    {node.subcategories?.length ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
