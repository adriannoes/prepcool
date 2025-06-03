// Main component
export { default as DisciplinaPlano } from './DisciplinaPlano';

// Sub-components
export { default as DisciplinaPlanoHeader } from './DisciplinaPlanoHeader';
export { default as PlanoItem } from './PlanoItem';

// Hooks
export { useDisciplinaPlanoLogic } from './useDisciplinaPlanoLogic';

// Types
export type {
  TopicoInfo,
  PlanoItem as PlanoItemType,
  DisciplinaInfo,
  DisciplinaPlanoProps,
  PlanoItemProps,
  DisciplinaPlanoHeaderProps,
  UseDisciplinaPlanoLogicProps,
  UseDisciplinaPlanoLogicReturn
} from './types'; 