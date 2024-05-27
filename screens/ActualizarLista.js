import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { db } from "../dataBase/Firebase";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";

const ActualizarLista = ({ route }) => {
  const { id } = route.params.producto;
  const [nuevaCategoria, setNuevaCategoria] = useState(route.params.producto.categoria);
  const [nuevoNombre, setNuevoNombre] = useState(route.params.producto.nombreProducto);
  const [nuevoPrecio, setNuevoPrecio] = useState(`${route.params.producto.precio}`);
  const [nuevoPrecioOferta, setNuevoPrecioOferta] = useState(`${route.params.producto.precioOferta}`);
  const [nuevaCantidad, setNuevaCantidad] = useState(route.params.producto.cantidad || "0");
  const [categorias, setCategorias] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const handleActualizarProducto = async () => {
    try {
      const nuevosValores = {
        id: id,
        categoria: nuevaCategoria,
        nombreProducto: nuevoNombre,
        precio: parseFloat(nuevoPrecio),
        precioOferta: parseFloat(nuevoPrecioOferta),
        cantidad: parseInt(nuevaCantidad),
      };

      await updateDoc(doc(db, "productos", id), nuevosValores);

      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      setRefreshing(true);
      const categoriasSnapshot = await getDocs(collection(db, "categorias"));
      const categoriasData = categoriasSnapshot.docs.map((doc) => doc.data().nombreCategoria);
      setCategorias(categoriasData);
      setRefreshing(false);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
      Alert.alert("Error", "Hubo un error al obtener las categorías.");
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ID:</Text>
      <TextInput style={styles.input} value={id} editable={false} />
      <Text style={styles.label}>Nombre del Producto:</Text>
      <TextInput
        style={styles.input}
        value={nuevoNombre}
        onChangeText={(text) => setNuevoNombre(text)}
      />

      <Text style={styles.label}>Categoría:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nuevaCategoria}
          onValueChange={(itemValue) => setNuevaCategoria(itemValue)}
        >
          <Picker.Item label="Seleccione una categoría" value="" />
          {categorias.map((categoria, index) => (
            <Picker.Item key={index} label={categoria} value={categoria} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Precio:</Text>
      <TextInput
        style={styles.input}
        value={nuevoPrecio}
        onChangeText={(text) => setNuevoPrecio(text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio de Oferta:</Text>
      <TextInput
        style={styles.input}
        value={nuevoPrecioOferta}
        onChangeText={(text) => setNuevoPrecioOferta(text)}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Cantidad:</Text>
      <TextInput
        style={styles.input}
        value={nuevaCantidad}
        onChangeText={(text) => setNuevaCantidad(text)}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={handleActualizarProducto} style={styles.boton}>
        <Text style={styles.botonText}>Actualizar Producto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#D4D4D4",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 8,
    paddingLeft: 40,
    color: "#333",
    borderRadius: 10,
    marginBottom: 20,
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#D4D4D4",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderRadius: 10,
    marginBottom: 20,
  },
  boton: {
    backgroundColor: "#1C2120",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  botonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ActualizarLista;
