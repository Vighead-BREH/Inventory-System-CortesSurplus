<script setup>
import {RouterView } from 'vue-router'
import db from './firebase/init'
import { collection, addDoc} from 'firebase/firestore'

async function addData() {
  const docRef = collection(db, 'materials');
  const doc = await addDoc(docRef, {
    totalStock: 100,
    stockUsed: 50
  });
  console.log('Document written with ID: ', doc.id);
}
addData()

</script>
<template>
  <RouterView/>
</template>
