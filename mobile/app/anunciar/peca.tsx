import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { router } from 'expo-router';
import { KeyboardAvoider } from '@/components/ui/KeyboardAvoider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { PhotoPicker } from '@/components/anunciar/PhotoPicker';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { addPeca, uploadAnuncioFoto } from '@/lib/db';
import { TIPO_PECA_LABELS, type TipoPeca } from '@/types';

const TIPOS = (Object.keys(TIPO_PECA_LABELS) as TipoPeca[]).map((t) => ({
  value: t,
  label: TIPO_PECA_LABELS[t],
}));

const ESTADOS = ['Novo', 'Usado', 'Recondicionado'].map((e) => ({ value: e, label: e }));

export default function AnunciarPecaScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [foto, setFoto] = useState<string[]>([]);
  const [tipo, setTipo] = useState<TipoPeca>('venda');
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [preco, setPreco] = useState('');
  const [estado, setEstado] = useState<string>('Usado');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [enviando, setEnviando] = useState(false);

  const precisaPreco = tipo !== 'procura';

  function validar(): string | null {
    if (!titulo.trim()) return 'Indique um título.';
    if (!categoria.trim()) return 'Indique a categoria (ex.: Motor, Travões).';
    if (!marca.trim()) return 'Indique a marca do carro.';
    if (precisaPreco && (!preco.trim() || Number.isNaN(Number(preco))))
      return 'Indique um preço válido.';
    if (!local.trim()) return 'Indique a localidade.';
    return null;
  }

  async function publicar() {
    if (!user) {
      router.replace('/login');
      return;
    }
    const erro = validar();
    if (erro) {
      showToast(erro, 'error');
      return;
    }

    setEnviando(true);
    try {
      const fotoUrl = foto[0] ? await uploadAnuncioFoto(user.uid, foto[0], 0) : undefined;

      await addPeca({
        tipo,
        titulo: titulo.trim(),
        categoria: categoria.trim(),
        marcaCarro: marca.trim(),
        modeloCarro: modelo.trim() || undefined,
        preco: precisaPreco ? Number(preco) : null,
        estado,
        local: local.trim(),
        descricao: descricao.trim(),
        foto: fotoUrl,
        criador: user.email,
        criadorUid: user.uid,
        vendedorNome: user.nome,
        vendedorTelefone: telefone.trim() || undefined,
        vendedorWhatsApp: whatsapp.trim() || undefined,
        vendedorEmail: user.email,
      });

      Alert.alert(
        'Anúncio enviado',
        'A sua peça foi submetida e ficará visível após aprovação.',
        [{ text: 'OK', onPress: () => router.dismissAll() }],
      );
    } catch {
      showToast('Não foi possível publicar. Tente novamente.', 'error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoider offset={headerHeight} className="flex-1 bg-neutral-50">
      <ScrollView
        contentContainerClassName="p-4 gap-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <ChipSelect label="Tipo de anúncio" options={TIPOS} value={tipo} onChange={setTipo} />
        <PhotoPicker fotos={foto} onChange={setFoto} max={1} />

        <Input label="Título *" value={titulo} onChangeText={setTitulo} placeholder="Farol dianteiro esquerdo" />
        <Input label="Categoria *" value={categoria} onChangeText={setCategoria} placeholder="Iluminação" />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Marca do carro *" value={marca} onChangeText={setMarca} placeholder="Renault" />
          </View>
          <View className="flex-1">
            <Input label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Clio" />
          </View>
        </View>

        {precisaPreco && (
          <Input
            label="Preço (€) *"
            value={preco}
            onChangeText={setPreco}
            placeholder="60"
            keyboardType="number-pad"
          />
        )}

        <ChipSelect label="Estado" options={ESTADOS} value={estado} onChange={setEstado} />
        <Input label="Localidade *" value={local} onChangeText={setLocal} placeholder="Porto" />
        <Input
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Compatibilidade, estado, observações…"
          multiline
          numberOfLines={4}
          className="h-28"
          style={{ textAlignVertical: 'top' }}
        />

        <Text className="mt-2 text-base font-bold text-fg-heading">Contacto</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Telefone" value={telefone} onChangeText={setTelefone} placeholder="912345678" keyboardType="phone-pad" />
          </View>
          <View className="flex-1">
            <Input label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} placeholder="912345678" keyboardType="phone-pad" />
          </View>
        </View>

        <Button
          label={enviando ? 'A publicar…' : 'Publicar peça'}
          onPress={publicar}
          loading={enviando}
          className="mt-2"
        />
        <Text className="text-center text-xs text-fg-subtle">
          O anúncio fica visível após aprovação da equipa.
        </Text>
      </ScrollView>
    </KeyboardAvoider>
  );
}
