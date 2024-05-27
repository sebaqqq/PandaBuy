import { StyleSheet } from "react-native";

export const EditarUserStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 36,
  },
  logoImage: {
    width: 100,   
    height: 100,  
    resizeMode: 'contain', 
  },
  textTitle: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userData: {
    marginBottom: 20,
  },
  userDataText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    backgroundColor: "#D4D4D4",
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: "100%",
    borderRadius: 10,
    paddingLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333333",
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
