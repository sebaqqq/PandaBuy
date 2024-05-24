import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Audio } from "expo-av";
import { db, auth } from "../dataBase/Firebase";
import { getDoc, doc, collection, addDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { serverTimestamp } from "firebase/firestore";


const EscanerCodigoBarras = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [totalCompra, setTotalCompra] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    calcularTotal();
  }, [carrito]);

  const calcularTotal = () => {
    const total = carrito.reduce(
      (acc, producto) => acc + producto.precio * producto.cantidad,
      0
    );
    setTotalCompra(total.toFixed(0));
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../sound/beep.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Error al reproducir el sonido:", error);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!scanning) return;

    try {
      const productoDoc = doc(db, "productos", data);
      const productoSnap = await getDoc(productoDoc);

      if (!productoSnap.exists()) {
        console.log("Producto no encontrado");
        Alert.alert("Producto no encontrado");
        return;
      }

      const productoData = productoSnap.data();
      if (productoData) {
        const existingProductIndex = carrito.findIndex(
          (item) => item.idProducto === productoData.idProducto
        );
        if (existingProductIndex !== -1) {
          return;
        }

        const nuevoProducto = { ...productoData, cantidad: 1 };
        setCarrito([...carrito, nuevoProducto]);

        playSound();

        setScanning(false);
      } else {
        console.log("Error: el documento del producto está vacío");
        Alert.alert("Error: el documento del producto está vacío");
      }
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      Alert.alert("Error al obtener el producto");
    }
  };

  const removeFromCart = (productId) => {
    setCarrito(carrito.filter((item) => item.idProducto !== productId));
  };

  const actualizarCantidad = (productId, nuevaCantidad) => {
    const nuevoCarrito = carrito.map((item) => {
      if (item.idProducto === productId) {
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      Alert.alert(
        "Carrito vacío",
        "Agrega al menos un producto al carrito antes de finalizar la compra."
      );
      return;
    }

    const finalizarCompra = async () => {
      if (carrito.length === 0) {
        Alert.alert(
          "Carrito vacío",
          "Agrega al menos un producto al carrito antes de finalizar la compra."
        );
        return;
      }
    
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const userDoc = doc(db, "users", userId);
          const userSnap = await getDoc(userDoc); // Marca la función como async
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const firstName = userData.firstName;
            console.log("Nombre del usuario:", firstName);
    
            await addDoc(collection(db, "historialVentas"), {
              carrito,
              totalCompra,
              fecha: obtenerFechaActual(), // Utiliza la función para obtener la fecha actual
              usuario: { firstName },
            });
    
            setCarrito([]);
            setTotalCompra(0);
    
            Alert.alert("Compra finalizada");
          } else {
            console.error("Usuario no encontrado");
            Alert.alert("Usuario no encontrado");
          }
        } else {
          Alert.alert(
            "Usuario no autenticado",
            "Debes iniciar sesión para finalizar la compra."
          );
        }
      } catch (error) {
        console.error("Error al finalizar la compra:", error);
        Alert.alert(
          "Error al finalizar la compra",
          "Por favor, inténtalo de nuevo más tarde."
        );
      }
    };
    

    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userDoc = doc(db, "users", userId);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const firstName = userData.firstName;
          console.log("Nombre del usuario:", firstName);

          await addDoc(collection(db, "historialVentas"), {
            carrito,
            totalCompra,
            fecha: serverTimestamp(),
            usuario: { firstName },
          });

          setCarrito([]);
          setTotalCompra(0);

          Alert.alert("Compra finalizada");
        } else {
          console.error("Usuario no encontrado");
          Alert.alert("Usuario no encontrado");
        }
      } else {
        Alert.alert(
          "Usuario no autenticado",
          "Debes iniciar sesión para finalizar la compra."
        );
      }
    } catch (error) {
      console.error("Error al finalizar la compra:", error);
      Alert.alert(
        "Error al finalizar la compra",
        "Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  const reloadCamera = () => {
    setScanning(true);
    setRefreshing(true);
    setReloadKey((prevKey) => prevKey + 1);
  };

  const onRefresh = () => {
    reloadCamera();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de la cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Permiso de la cámara no concedido</Text>;
  }


  return (
    <View style={styles.container}>

        <View style={styles.scannerContainer}>
          <BarCodeScanner
            key={reloadKey}
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={handleBarCodeScanned}
          />
          <View style={styles.scannerRect}></View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actualizarButton}
              onPress={reloadCamera}>
            <Text style={styles.buttonText}>Reiniciar Escáner</Text>
          </TouchableOpacity>
        </View>
        </View>


        <ScrollView style={styles.carritoContainer}>
          {carrito.map((producto) => (
            <View key={producto.idProducto} style={styles.producto}>
              <View style={styles.nombrePrecioContainer}>
                <Text numberOfLines={2} ellipsizeMode="tail">
                  producto: {producto.nombreProducto}
                </Text>
                <Text>Precio: ${producto.precio.toFixed(0)}</Text>
              </View>
              <View style={styles.cantidadEliminarContainer}>
                <View style={styles.cantidadContainer}>
                  <Button
                    title={"-"}
                    onPress={() =>
                      actualizarCantidad(
                        producto.idProducto,
                        Math.max(producto.cantidad - 1, 0)
                      )
                    }
                  />
                  <Text style={styles.cantidadText}>{producto.cantidad}</Text>
                  <Button
                    title={"+"}
                    onPress={() =>
                      actualizarCantidad(
                        producto.idProducto,
                        producto.cantidad + 1
                      )
                    }
                  />
                </View>
                {producto.cantidad === 0 && (
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={20}
                    color="white"
                    style={styles.iconoEliminar}
                    onPress={() => removeFromCart(producto.idProducto)}
                  />
                )}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ${totalCompra}</Text>
          <TouchableOpacity onPress={finalizarCompra} style={styles.boton}>
            <Text style={styles.botonText}>Finalizar Compra</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContainer: {
    flexDirection: "column", // Cambio a columna para centrar verticalmente
    justifyContent: "center", // Centrado vertical
    alignItems: "center", // Centrado horizontal
    width: "95%",
    marginTop: "10%",
  },
  scannerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  scannerRect: {
    width: Dimensions.get("window").width * 0.4,
    height: "25%",
    borderWidth: 3,
    borderColor: "yellow",
    borderRadius: 10,
    opacity: 0.5,
  },
  absoluteFillObject:{
    width: "100%",

  },
  actualizarButton: {
    backgroundColor: "#EDEDED",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  carritoContainer: {
    width: "100%",
    marginVertical: 5,
  },
  producto: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },
  cantidadContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cantidadText: {
    paddingHorizontal: 16,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  iconoEliminar: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  totalContainer: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    padding: 10,
    alignItems: "center",
  },
  boton: {
    backgroundColor: "#1C2120",
    padding: 10,
    borderRadius: 8,
    width: "72%",
    alignItems: "center",
  },
  botonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default EscanerCodigoBarras;
