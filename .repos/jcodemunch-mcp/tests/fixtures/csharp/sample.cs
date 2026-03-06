using System;
using System.Collections.Generic;

namespace SampleApp
{
    /// <summary>Manages user data and operations.</summary>
    public class UserService
    {
        /// <summary>Initializes the service.</summary>
        public UserService() {}

        /// <summary>Gets a user by identifier.</summary>
        [Obsolete("Use GetUserAsync instead")]
        public string GetUser(int userId) => $"user-{userId}";

        /// <summary>Removes a user from the system.</summary>
        public bool DeleteUser(int userId) { return true; }
    }

    /// <summary>Repository contract for data access.</summary>
    public interface IRepository
    {
        /// <summary>Returns all items.</summary>
        List<string> GetAll();
    }

    /// <summary>Request status codes.</summary>
    public enum Status { Pending, Active, Done }

    /// <summary>A 2D coordinate.</summary>
    public struct Point
    {
        public int X;
        public int Y;
    }

    /// <summary>Delegate for event callbacks.</summary>
    public delegate void EventCallback(object sender, EventArgs e);

    /// <summary>An immutable person record.</summary>
    public record Person(string Name, int Age);

    /// <summary>Extension methods for strings.</summary>
    public static class StringExtensions
    {
        /// <summary>Returns true if the string is null or whitespace.</summary>
        public static bool IsBlank(this string s) => string.IsNullOrWhiteSpace(s);
    }
}
