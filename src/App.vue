<template>

  <div class="min-h-screen bg-gray-100">

      <nav class="bg-white shadow p-4">

          <div class="flex gap-4">

              <RouterLink to="/">
                  Dashboard
              </RouterLink>

              <RouterLink to="/devices">
                  Devices
              </RouterLink>

              <RouterLink to="/scan">
                  Scan
              </RouterLink>

          </div>

      </nav>

      <div class="p-5">

          <router-view />

      </div>

  </div>

</template>