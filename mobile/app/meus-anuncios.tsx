import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  deleteCarro,
  deleteOficina,
  deletePeca,
  getCarrosByCreator,
  getOficinasByCreator,
  getPecasByCreator,
} from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import type { StatusAnuncio } from '@/types';
import { colors } from '@/theme/colors';

type Kind = 'carro' | 'peca' | 'oficina';

interface Item {
  kind: Kind;
  id: string;
  titulo: string;
  subtitulo: string;
  status: StatusAnuncio;
}

const STATUS: Record<StatusAnuncio, { label: string; bg: string; fg: string }> = {
  pendente: { label: 'Em revisão', bg: 'bg-warning-100', fg: 'text-warning-700' },
  aprovado: { label: 'Aprovado', bg: 'bg-success-100', fg: 'text-success-700' },
  rejeitado: { label: 'Rejeitado', bg: 'bg-danger-100', fg: 'text-danger-700' },
};

const KIND_ICON: Record<Kind, keyof typeof Ionicons.glyphMap> = {
  carro: 'car-sport',
  peca: 'construct',
  oficina: 'business',
};

export default function MeusAnunciosScreen() {
  const { user } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    if (!user?.email) return;
    const [carros, pecas, oficinas] = await Promise.all([
      getCarrosByCreator(user.email),
      getPecasByCreator(user.email),
      getOficinasByCreator(user.email),
    ]);
    const lista: Item[] = [
      ...carros.map((c) => ({
        kind: 'carro' as const,
        id: c.id,
        titulo: `${c.marca} ${c.modelo}`,
        subtitulo: `${c.anoFabricacao} · ${c.local}`,
        status: c.status,
      })),
      ...pecas.map((p) => ({
        kind: 'peca' as const,
        id: p.id,
        titulo: p.titulo,
        subtitulo: `${p.categoria} · ${p.local}`,
        status: p.status,
      })),
      ...oficinas.map((o) => ({
        kind: 'oficina' as const,
        id: o.id,
        titulo: o.nome,
        subtitulo: [o.localidade, o.distrito].filter(Boolean).join(', '),
        status: o.status,
      })),
    ];
    setItens(lista);
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      carregar().finally(() => setLoading(false));
    }, [carregar]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await carregar().catch(() => {});
    setRefreshing(false);
  }

  function abrir(item: Item) {
    if (item.kind === 'carro') router.push(`/detalhes/${item.id}`);
    else if (item.kind === 'peca') router.push(`/pecas/${item.id}`);
    else router.push(`/oficinas/${item.id}`);
  }

  function confirmarRemover(item: Item) {
    Alert.alert('Eliminar anúncio', `Remover "${item.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const remover = { carro: deleteCarro, peca: deletePeca, oficina: deleteOficina }[item.kind];
          try {
            await remover(item.id);
            setItens((atual) => atual.filter((x) => !(x.id === item.id && x.kind === item.kind)));
          } catch {
            Alert.alert('Erro', 'Não foi possível eliminar.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-50"
      data={itens}
      keyExtractor={(item) => `${item.kind}_${item.id}`}
      contentContainerClassName="p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => abrir(item)}
          className="mb-3 flex-row items-center rounded-2xl bg-white p-3 shadow-sm active:opacity-90"
        >
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
            <Ionicons name={KIND_ICON[item.kind]} size={22} color={colors.primary[600]} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-fg-heading" numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text className="text-sm text-fg-muted" numberOfLines={1}>
              {item.subtitulo}
            </Text>
            <View className={`mt-1 self-start rounded px-2 py-0.5 ${STATUS[item.status].bg}`}>
              <Text className={`text-[11px] font-bold ${STATUS[item.status].fg}`}>
                {STATUS[item.status].label}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => confirmarRemover(item)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Eliminar"
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger[500]} />
          </Pressable>
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="file-tray-outline"
          titulo="Sem anúncios"
          texto="Os anúncios que publicar aparecem aqui."
        />
      }
    />
  );
}
