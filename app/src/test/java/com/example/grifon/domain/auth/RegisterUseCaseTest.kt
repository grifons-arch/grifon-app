package com.example.grifon.domain.auth

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class RegisterUseCaseTest {
    @Test
    fun `returns success from repository`() = runBlocking {
        val expected = RegisterOutcome.Success(
            RegisterResult(
                customerId = "123",
                status = "PENDING",
                message = "ok",
            ),
        )
        val useCase = RegisterUseCase(FakeRegisterRepository(expected))

        val result = useCase(
            RegisterParams(
                email = "test@example.com",
                passwd = "secret123",
                firstName = "Test",
                lastName = "User",
                countryIso = "GR",
                street = "Main 1",
                city = "Athens",
                postalCode = "10564",
            ),
        )

        assertEquals(expected, result)
    }

    @Test
    fun `returns error from repository`() = runBlocking {
        val expected = RegisterOutcome.Error("failed")
        val useCase = RegisterUseCase(FakeRegisterRepository(expected))

        val result = useCase(
            RegisterParams(
                email = "test@example.com",
                passwd = "secret123",
                firstName = "Test",
                lastName = "User",
                countryIso = "GR",
                street = "Main 1",
                city = "Athens",
                postalCode = "10564",
            ),
        )

        assertEquals(expected, result)
    }
}

private class FakeRegisterRepository(
    private val result: RegisterOutcome,
) : RegisterRepository {
    override suspend fun register(params: RegisterParams): RegisterOutcome = result
}
