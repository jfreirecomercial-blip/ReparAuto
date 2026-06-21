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
import { addCarro, uploadAnuncioFoto } from '@/lib/db';
import {
  CAMBIOS,
  COMBUSTIVEIS,
  ESTADOS_VEICULO,
  MAX_FOTOS_CARRO,
} from '@/lib/constants';
import type { Cambio, Combustivel, EstadoVeiculo } from '@/types';

export default function AnunciarScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [fotos, setFotos] = useState<string[]>([]);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [km, setKm] = useState('');
  const [preco, setPreco] = useState('');
  const [cor, setCor] = useState('');
  const [portas, setPortas] = useState('5');
  const [combustivel, setCombustivel] = useState<Combustivel | null>(null);
  const [cambio, setCambio] = useState<Cambio | null>(null);
  const [estado, setEstado] = useState<EstadoVeiculo>('pronto');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [enviando, setEnviando] = useState(false);

  function validar(): string | null {
    if (fotos.length === 0) return 'Adicione pelo menos uma foto.';
    if (!marca.trim() || !modelo.trim()) return 'Indique a marca e o modelo.';
    const anoNum = Number(ano);
    if (!anoNum || anoNum < 1950 || anoNum > new Date().getFullYear() + 1)
      return 'Indique um ano válido.';
    if (!km.trim() || Number.isNaN(Number(km))) return 'Indique os quilómetros.';
    if (!preco.trim() || Number.isNaN(Number(preco))) return 'Indique um preço válido.';
    if (!combustivel) return 'Selecione o combustível.';
    if (!cambio) return 'Selecione a caixa.';
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
      const urls = await Promise.all(
        fotos.map((uri, i) => uploadAnuncioFoto(user.uid, uri, i)),
      );

      await addCarro({
        marca: marca.trim(),
        modelo: modelo.trim(),
        anoFabricacao: Number(ano),
        km: Number(km),
        preco: Number(preco),
        portas: Number(portas) || 5,
        cor: cor.trim() || 'Não especificada',
        combustivel,
        cambio,
        estadoVeiculo: estado,
        tiposManutencao: [],
        local: local.trim(),
        descricao: descricao.trim(),
        fotos: urls,
        criador: user.email,
        criadorUid: user.uid,
        vendedorNome: user.nome,
        vendedorTelefone: telefone.trim() || undefined,
        vendedorWhatsApp: whatsapp.trim() || undefined,
        vendedorEmail: user.email,
      });

      Alert.alert(
        'Anúncio enviado',
        'O seu anúncio foi submetido e ficará visível após aprovação.',
        [
          {
            text: 'OK',
            onPress: () => router.dismissAll(),
          },
        ],
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
        <PhotoPicker fotos={fotos} onChange={setFotos} max={MAX_FOTOS_CARRO} />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Marca *" value={marca} onChangeText={setMarca} placeholder="BMW" />
          </View>
          <View className="flex-1">
            <Input label="Modelo *" value={modelo} onChangeText={setModelo} placeholder="320d" />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Ano *"
              value={ano}
              onChangeText={setAno}
              placeholder="2018"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Quilómetros *"
              value={km}
              onChangeText={setKm}
              placeholder="120000"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Preço (€) *"
              value={preco}
              onChangeText={setPreco}
              placeholder="15000"
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Portas"
              value={portas}
              onChangeText={setPortas}
              placeholder="5"
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>
        </View>

        <Input label="Cor" value={cor} onChangeText={setCor} placeholder="Preto" />

        <ChipSelect
          label="Combustível *"
          options={COMBUSTIVEIS.map((c) => ({ value: c, label: c }))}
          value={combustivel}
          onChange={setCombustivel}
        />
        <ChipSelect
          label="Caixa *"
          options={CAMBIOS.map((c) => ({ value: c, label: c }))}
          value={cambio}
          onChange={setCambio}
        />
        <ChipSelect label="Estado" options={ESTADOS_VEICULO} value={estado} onChange={setEstado} />

        <Input label="Localidade *" value={local} onChangeText={setLocal} placeholder="Lisboa" />

        <Input
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Estado, extras, histórico de manutenção…"
          multiline
          numberOfLines={4}
          className="h-28"
          style={{ textAlignVertical: 'top' }}
        />

        <Text className="mt-2 text-base font-bold text-fg-heading">Contacto</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              placeholder="912345678"
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="WhatsApp"
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="912345678"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Button
          label={enviando ? 'A publicar…' : 'Publicar anúncio'}
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
