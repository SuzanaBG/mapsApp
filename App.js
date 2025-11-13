import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, View, Dimensions, TextInput, Pressable, Text, Alert } from 'react-native'
import MapView, { Marker } from "react-native-maps"
import Constants from 'expo-constants'

export default function App() {
  const [textoLocal, setTextoLocal] = useState("")
  const mapRef = useRef(null)
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey

  const original = {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }
  const [markerPos, setMarkerPos] = useState({
    latitude: original.latitude,
    longitude: original.longitude,
  })

  const [regiao, setRegiao] = useState(original)

  const handleSearch = async () => {
    if (!textoLocal) return

    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          textoLocal
        )}&key=${GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await resp.json()

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location

        const novaRegiao = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setMarkerPos({ latitude: lat, longitude: lng })

        if (mapRef.current) {
          mapRef.current.animateToRegion(novaRegiao, 1000)
        }

        setRegiao(novaRegiao)
      } else {
        Alert.alert("Local não encontrado", "Tente outro nome.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível buscar o local.");
    }
  }

  const resetMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(original, 1000);
      setMarkerPos({
        latitude: original.latitude,
        longitude: original.longitude,
      })
      setRegiao(original)
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.campoBotao}>
        <View style={styles.campoBusca}>
        <TextInput
          style={styles.input}
          placeholder="Pesquise um local"
          value={textoLocal}
          onChangeText={setTextoLocal}
          onSubmitEditing={handleSearch} 
          returnKeyType="search"
        />

        <Pressable style={styles.buttonBusca} onPress={handleSearch}>
          <Text style={styles.buttonText}>Buscar</Text>
        </Pressable>
      </View>

      <Pressable style={styles.buttonReset} onPress={resetMap}>
        <Text style={styles.buttonText}>Resetar Mapa</Text>
      </Pressable>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
            style={styles.map}
            initialRegion={original} 
            onRegionChangeComplete={(reg) => setRegiao(reg)}
        >
          <Marker coordinate={markerPos} title={"Local selecionado"} />
        </MapView>
      </View>
    </View>
  )
}

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',   
    backgroundColor: '#f0e7d5',
  },

  mapContainer: {
    width: '90%',
    height: '50%',
    borderWidth: 5,          
    borderColor: '#212842', 
    borderRadius: 50,
    overflow: 'hidden',
  },

  map: {
    flex: 1, 
  },

  input: {
    width: 250,
    height: 50,
    borderWidth: 2,
    borderColor: '#212842', 
    borderRadius: 50,       
    overflow: 'hidden',
    marginBottom: 50,
  },

  buttonBusca: {
    backgroundColor: '#212842',
    borderRadius: 5,
    overflow: 'hidden',
    width: 70,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#f0e7d5',
  },

  campoBusca: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },

  buttonReset: {
    backgroundColor: '#212842',
    borderRadius: 5,
    overflow: 'hidden',
    width: 105,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  campoBotao: {
    width: '90%',
    alignItems: 'center',
    marginBottom: 50,
  },
})