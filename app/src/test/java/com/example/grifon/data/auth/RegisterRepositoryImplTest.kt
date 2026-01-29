package com.example.grifon.data.auth

import com.example.grifon.domain.auth.RegisterOutcome
import com.example.grifon.domain.auth.RegisterParams
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class RegisterRepositoryImplTest {
    @Test
    fun `register payload uses passwd key`() {
        val moshi = Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()
        val adapter = moshi.adapter(RegisterRequestDto::class.java)
        val payload = RegisterRequestDto(
            email = "test@example.com",
            passwd = "secret123",
            firstName = "Test",
            lastName = "User",
            countryIso = "GR",
            street = "Main 1",
            city = "Athens",
            postalCode = "10564",
        )

        val json = adapter.toJson(payload)

        assertTrue(json.contains("\"passwd\""))
        assertTrue(!json.contains("\"password\""))
    }

    @Test
    fun `rejects password shorter than 8 characters`() = runBlocking {
        val api = CapturingAuthApi()
        val repository = RegisterRepositoryImpl(api)

        val result = repository.register(
            RegisterParams(
                email = "test@example.com",
                passwd = "short",
                firstName = "Test",
                lastName = "User",
                countryIso = "GR",
                street = "Main 1",
                city = "Athens",
                postalCode = "10564",
            ),
        )

        assertEquals(
            RegisterOutcome.Error("Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες."),
            result,
        )
        assertTrue(api.capturedRequests.isEmpty())
    }
}

private class CapturingAuthApi : AuthApi {
    val capturedRequests = mutableListOf<RegisterRequestDto>()

    override suspend fun register(request: RegisterRequestDto): RegisterResponseDto {
        capturedRequests.add(request)
        return RegisterResponseDto(
            customerId = "123",
            status = "ok",
            message = "ok",
        )
    }
}
