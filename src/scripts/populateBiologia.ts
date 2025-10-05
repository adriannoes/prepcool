
import { supabase } from '@/integrations/supabase/client';

export const populateBiologia = async () => {
  try {
    console.log('🔬 Iniciando população de dados de Biologia...');

    // 1. Verificar se a disciplina Biologia já existe, se não, criar
    let { data: biologiaData, error: biologiaError } = await supabase
      .from('disciplina')
      .select('*')
      .eq('nome', 'Biologia')
      .maybeSingle();

    if (biologiaError) throw biologiaError;

    let biologiaId: string;
    if (!biologiaData) {
      console.log('📚 Criando disciplina Biologia...');
      const { data: newBiologia, error: createError } = await supabase
        .from('disciplina')
        .insert({ nome: 'Biologia' })
        .select()
        .single();

      if (createError) throw createError;
      biologiaId = newBiologia.id;
      console.log('✅ Disciplina Biologia criada:', biologiaId);
    } else {
      biologiaId = biologiaData.id;
      console.log('✅ Disciplina Biologia já existe:', biologiaId);
    }

    // 2. Definir tópicos e vídeos
    const topicosEVideos = [
      {
        nome: 'Ecologia',
        videos: [
          {
            titulo: 'AULÃO ENEM DE ECOLOGIA: Biosferas, Biomas, Ecossistemas',
            url: 'https://www.youtube.com/watch?v=aIFFhMRWPQw',
            descricao: 'Revisão completa de ecologia para o ENEM, cobrindo biosferas, biomas e ecossistemas.'
          },
          {
            titulo: 'Relações Ecológicas (Harmônicas e Desarmônicas)',
            url: 'https://www.youtube.com/watch?v=cpmcIciaIWc',
            descricao: 'Estudo das relações entre organismos: harmônicas (mutualismo, comensalismo) e desarmônicas (predação, parasitismo).'
          },
          {
            titulo: 'Teia Trófica e Ciclos Biogeoquímicos',
            url: 'https://www.youtube.com/watch?v=Gh7hsluxaxs',
            descricao: 'Compreensão das teias alimentares e dos ciclos da água, carbono, nitrogênio e outros elementos.'
          }
        ]
      },
      {
        nome: 'Genética e Biologia Molecular',
        videos: [
          {
            titulo: 'AULÃO ENEM DE BIOLOGIA – Prof.ª Cláudia de Souza Aguiar (Genética e Evolução)',
            url: 'https://www.youtube.com/watch?v=fo7JbUG5flY',
            descricao: 'Revisão abrangente de genética e evolução para o ENEM, incluindo leis de Mendel, herança e evolução.'
          },
          {
            titulo: '10 temas de genética que mais caem no Enem',
            url: 'https://www.youtube.com/watch?v=1HUHnnPmuzU',
            descricao: 'Foco nos principais temas de genética cobrados no ENEM: DNA, RNA, mutações, hereditariedade.'
          }
        ]
      },
      {
        nome: 'Citologia (Células)',
        videos: [
          {
            titulo: 'Super-revisão de Citologia para o Enem 2024 – Reta Final ProEnem',
            url: 'https://www.youtube.com/watch?v=-ZkN5UDR7NQ',
            descricao: 'Revisão completa de citologia: estrutura celular, organelas, membrana plasmática, divisão celular.'
          }
        ]
      },
      {
        nome: 'Evolução',
        videos: [
          {
            titulo: 'AULÃO ENEM DE BIOLOGIA – Evolução (Darwin, Lamarck, Seleção Natural)',
            url: 'https://www.youtube.com/watch?v=fo7JbUG5flY',
            descricao: 'Estudo da evolução: teorias de Darwin e Lamarck, seleção natural, especiação e evidências evolutivas.'
          }
        ]
      },
      {
        nome: 'Anatomia e Fisiologia Humana',
        videos: [
          {
            titulo: 'AULÃO ENEM DE BIOLOGIA – Sistemas do Corpo Humano',
            url: 'https://www.youtube.com/watch?v=fo7JbUG5flY',
            descricao: 'Revisão dos principais sistemas do corpo humano: circulatório, respiratório, digestório, nervoso, endócrino.'
          }
        ]
      }
    ];

    // 3. Criar tópicos e vídeos
    for (const topicoData of topicosEVideos) {
      console.log(`🔬 Processando tópico: ${topicoData.nome}`);

      // Verificar se o tópico já existe
      let { data: topicoExistente, error: topicoError } = await supabase
        .from('topico')
        .select('*')
        .eq('nome', topicoData.nome)
        .eq('disciplina_id', biologiaId)
        .maybeSingle();

      if (topicoError) throw topicoError;

      let topicoId: string;
      if (!topicoExistente) {
        const { data: novoTopico, error: createTopicoError } = await supabase
          .from('topico')
          .insert({
            nome: topicoData.nome,
            disciplina_id: biologiaId
          })
          .select()
          .single();

        if (createTopicoError) throw createTopicoError;
        topicoId = novoTopico.id;
        console.log(`✅ Tópico criado: ${topicoData.nome}`);
      } else {
        topicoId = topicoExistente.id;
        console.log(`✅ Tópico já existe: ${topicoData.nome}`);
      }

      // Inserir vídeos do tópico
      for (const video of topicoData.videos) {
        // Verificar se o vídeo já existe
        const { data: videoExistente, error: videoCheckError } = await supabase
          .from('video')
          .select('*')
          .eq('titulo', video.titulo)
          .eq('topico_id', topicoId)
          .maybeSingle();

        if (videoCheckError) throw videoCheckError;

        if (!videoExistente) {
          const { error: insertVideoError } = await supabase
            .from('video')
            .insert({
              titulo: video.titulo,
              url: video.url,
              descricao: video.descricao,
              topico_id: topicoId
            });

          if (insertVideoError) throw insertVideoError;
          console.log(`✅ Vídeo criado: ${video.titulo}`);
        } else {
          console.log(`ℹ️ Vídeo já existe: ${video.titulo}`);
        }
      }
    }

    console.log('🎉 Biologia populada com sucesso!');
    return { success: true, message: 'Disciplina de Biologia criada com sucesso!' };

  } catch (error) {
    console.error('❌ Erro ao popular Biologia:', error);
    return { success: false, error: error.message };
  }
};
