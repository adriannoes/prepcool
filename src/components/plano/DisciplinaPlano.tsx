// Backward compatibility wrapper - uses the refactored modular version
export { DisciplinaPlano as default } from './disciplina-plano';

// Re-export types for backward compatibility
export type {
  TopicoInfo,
  PlanoItemType as PlanoItem,
  DisciplinaInfo,
  DisciplinaPlanoProps
} from './disciplina-plano';
